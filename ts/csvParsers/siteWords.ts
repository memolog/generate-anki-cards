import * as path from 'path';

const generateFileName = (fileName: string) => {
  return fileName
    .replace(/\s/g, '_')
    .replace(/[^0-9a-zA-Z_]/g, '')
    .toLocaleLowerCase();
};

const csvRowToJSON = (word: string) => {
  const fileName = generateFileName(word);

  const jsonData: any = {
    frontText: word,
    backText: word,
    backSound: {
      supplier: 'cambridge',
      name: fileName,
      searchWord: word,
    },
  };

  return jsonData;
};

export default function defaultCsvParser(data: string) {
  const result = [];
  let rows = data.split(/,/);
  rows = rows.map((row) => {
    if (row) {
      return row.trim();
    }
    return row;
  });
  for (const row of rows) {
    // skip blank line
    if (!row) {
      continue;
    }
    result.push(csvRowToJSON(row));
  }
  return result;
}
