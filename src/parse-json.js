const parse_json = (str) => {
  const chunks = [];
  let last_json_end_index = -1;
  let json_index = str.indexOf('{', last_json_end_index + 1);
  for (; json_index !== -1; json_index = str.indexOf('{', last_json_end_index + 1)) {
    if (json_index !== last_json_end_index + 1)
      chunks.push(str.substring(last_json_end_index, json_index));
    let json_end_index = str.indexOf('}', json_index + 1);
    while (true) {
      try {
        JSON.parse(str.substring(json_index, json_end_index + 1));
        break;
      } catch (e) {
        json_end_index = str.indexOf('}', json_end_index + 1);
        if (json_end_index === -1) throw new Error('Unterminated JSON object in string');
      }
    }
    chunks.push(str.substring(json_index, json_end_index + 1));
    last_json_end_index = json_end_index + 1;
  }
  if (last_json_end_index === -1) chunks.push(str);
  else if (str.length !== last_json_end_index) chunks.push(str.substr(last_json_end_index));
  return chunks;
};

module.exports = { parse_json };
