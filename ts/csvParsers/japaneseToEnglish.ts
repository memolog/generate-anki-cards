import {generateFileName} from './util';

const csvRowToJSON = (row: string) => {
  const [japanese, ...sentences] = row.split(/,/).map((r) => r.trim());
  let tips;
  for (const [index, sentence] of sentences.entries()) {
    // Basic Latin /\u0000-\u007F/
    // General Punctuation /\u2000-\u206F/
    if (/^[\u0000-\u007F\u2000-\u206F]*$/.test(sentence)) {
      continue;
    }
    tips = sentences.splice(index).join(', ');
    break;
  }
  const english = sentences.join(', ');
  const fileName = generateFileName(english);

  const jsonData: any = {
    frontText: japanese,
    backText: english,
    backSound: {
      supplier: 'google',
      name: fileName,
      searchWord: english,
      fallback: 'none',
    },
  };

  if (tips) {
    jsonData.backAppendix = tips;
  }

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
