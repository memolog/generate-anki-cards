const generateFileName = (fileName: string) => {
  return fileName
    .replace(/<[^>]+>([^<]*)<\/[^>]+>/, '$1')
    .replace(/\s/g, '_')
    .replace(/[^0-9a-zA-Z_]/g, '')
    .toLocaleLowerCase();
};

const csvRowToJSON = (row: string) => {
  const [word, ...sentences] = row.split(/,/).map((r) => r.trim());
  let sentence = sentences.join(', ');
  const fileName = generateFileName(word);

  sentence = sentence.replace(/&#44;/g, ',');

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

export default function defaultCsvParser(data: string) {
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
