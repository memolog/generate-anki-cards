'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
const generateFileName = (fileName) => {
  return fileName
    .replace(/<[^>]+\/?>/, '')
    .replace(/\s/g, '_')
    .replace(/[^0-9a-zA-Z_]/g, '')
    .toLocaleLowerCase();
};
const csvRowToJSON = (row) => {
  const [word, sentence] = row.split(/,/).map((r) => {
    r.trim();
  });
  const fileName = generateFileName(word);
  const jsonData = {
    frontText: word,
    backText: sentence,
    frontSound: {
      supplier: 'google',
      name: fileName,
      searchWord: sentence,
    },
  };
  return jsonData;
};
function defaultCsvParser(data) {
  const result = [];
  const rows = data.split(/\n/);
  for (const row of rows) {
    // skip blank line
    if (!row) {
      continue;
    }
    result.push(csvRowToJSON(row));
  }
  return result;
}
exports.default = defaultCsvParser;
