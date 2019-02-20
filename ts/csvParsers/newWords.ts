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
    let sentenceTranslation;
    for (const [index, sentence] of sentences.entries()) {
      // Basic Latin /\u0000-\u007F/
      // General Punctuation /\u2000-\u206F/
      if (/^[\u0000-\u007F\u2000-\u206F]*$/.test(sentence)) {
        continue;
      }
      sentenceTranslation = sentences.splice(index).join(', ');
      break;
    }
    const sentence = sentences.join(', ');
    const backSoundFileName = generateFileName(sentence);
    const backAppendix = sentenceTranslation
      ? `${sentence}<br>${sentenceTranslation}`
      : sentence;

    Object.assign(jsonData, {
      backAppendix: backAppendix,
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
