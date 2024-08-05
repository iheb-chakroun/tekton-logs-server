const { Storage } = require('@google-cloud/storage');
const { parse_json } = require('./parse-json');
const { log } = require('./log');

const storage = new Storage();
const bucketName = process.env.BUCKET_NAME;

const streamLogs = async (namespace, pod, container, response) => {
  log(`Getting ${namespace}/${pod}/${container}`);

  let [files] = await storage.bucket(bucketName).getFiles({
    prefix: `logs/${namespace}/${pod}/${container}/`,
    autoPaginate: false,
    delimiter: '',
  });

  if (files.length === 0) {
    log(`No files found with prefix logs/${namespace}/${pod}/${container}/, trying fallback prefix logs/${namespace}/${pod}/`);
    [files] = await storage.bucket(bucketName).getFiles({
      prefix: `logs/${namespace}/${pod}/`,
      autoPaginate: false,
      delimiter: '',
    });
    files = files.filter(file => file.name.startsWith(`logs/${namespace}/${pod}/${container}`));
  }

  let chunks = '';
  const fileNames = files.map((file) => file.name);

  log(fileNames.join('\n'));

  const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));

  for (const file of sortedFiles) {
    await new Promise((resolve, reject) => {
      const readStream = file.createReadStream();
      readStream.on('data', (chunk) => {
        chunks += Buffer.from(chunk, 'base64').toString('ascii');
      });
      readStream.on('end', resolve);
      readStream.on('error', reject);
    });
  }

  const parsedLogs = parse_json(chunks)
    .map((chunk) => {
      try {
        const parsed = JSON.parse(chunk);
        return { log: parsed.log || parsed.message, time: parsed.time };
      } catch {
        return null;
      }
    })
    .filter((chunk) => chunk)
    .sort((a, b) => (a.time > b.time ? 1 : a.time < b.time ? -1 : 0));

  for (const { log: logMessage } of parsedLogs) {
    response.write(`${logMessage}\n`);
  }

  response.end();
};

module.exports = { streamLogs };
