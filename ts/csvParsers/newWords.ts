import {generateFileName} from './util';

const csvRowToJSON = (row: string) => {
  const [word, translation, ...sentences] = row.split(/,/).map((r) => r.trim());
  const fileName = generateFileName(word);

  const jsonData = {
    frontText: word,
    frontSound: {
      supplier: 'cambridge',
      name: fileName,
      searchWord: word,
      fallback: 'google',
    },
    backText: translation,
    backImage: {
      supplier: 'cambridge',
      name: fileName,
      searchWord: word,
      fallback: 'none',
    },
  };

  if (sentences.length) {
    const sentenceTranslation = sentences.pop();
    const sentence = sentences.join(', ');
    const backSoundFileName = generateFileName(sentence);

    Object.assign(jsonData, {
      backAppendix: `${sentence}<br>${sentenceTranslation}`,
      backSound: {
        supplier: 'google',
        name: backSoundFileName,
        searchWord: sentence,
        fallback: 'none',
      },
    });
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
