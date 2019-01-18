import {generateFileName} from './util';

const csvRowToJSON = (row: string) => {
  const [japanese, ...sentences] = row.split(/,/).map((r) => r.trim());
  const english = sentences.join(', ');
  const fileName = generateFileName(english);

  const jsonData = {
    frontText: japanese,
    backText: english,
    backSound: {
      supplier: 'google',
      name: fileName,
      searchWord: english,
      fallback: 'none',
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
