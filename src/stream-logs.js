const { Storage } = require('@google-cloud/storage');
const { parse_json }  = require ('./parse-json')

const storage = new Storage();

const bucketName = process.env.BUCKET_NAME;

const streamLogs = async (namespace, pod, container, response) => {
  const [files] = await storage.bucket(bucketName).getFiles({
    prefix: namespace + "/" + pod + "/" + container + "/",
    autoPaginate: false,
    delimiter: "",
  });
  let chunks = "";
  files
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce(
      (acc, file) =>
        acc.then(
          () =>
            new Promise((resolve) =>
              file
                .createReadStream()
                .on("end", () => {
                  resolve();
                })
                .on("data", (chunk) => {
                  chunks = chunks.concat(
                    Buffer.from(chunk, "base64").toString("ascii")
                  );
                })
            )
        ),
      Promise.resolve()
    )
    .then(() => {
      parse_json(chunks)
        .map((chunk) => {
          try {
            const parsed = JSON.parse(chunk);
            return { log: parsed.log, time: parsed.time };
          } catch (e) {}
        })
        .filter((chunk) => chunk)
        .sort((a, b) =>
          a["time"] > b["time"] ? 1 : a["time"] < b["time"] ? -1 : 0
        )
        .map((chunk) => response.write(chunk["log"]));
      response.end();
    });
};

module.exports = { streamLogs };