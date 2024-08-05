const parse_json = (str) => {
  const chunks = [];
  let last_json_end_index = -1;
  let brace_balance = 0;
  let start = -1;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') {
      if (brace_balance === 0) {
        start = i;
      }
      brace_balance++;
    } else if (str[i] === '}') {
      brace_balance--;
      if (brace_balance === 0) {
        let json_str = str.substring(start, i + 1).trim();
        json_str = json_str.replace(/[\u0000-\u001F]+/g, ''); // remove unparsable characters
        try {
          JSON.parse(json_str);
          chunks.push(json_str);
        } catch (e) {
          throw new Error(`Invalid JSON object in string: ${json_str}`);
        }
        last_json_end_index = i;
      }
    }
  }

  if (last_json_end_index === -1) {
    chunks.push(str);
  } else if (str.length !== last_json_end_index + 1) {
    chunks.push(str.substring(last_json_end_index + 1));
  }

  return chunks;
};

module.exports = { parse_json };
