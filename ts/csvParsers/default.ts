import * as path from 'path';

const generateFileName = (fileName: string) => {
  return fileName
    .replace(/\s/g, '_')
    .replace(/[^0-9a-zA-Z_]/g, '')
    .toLocaleLowerCase();
};

const csvRowToJSON = (row: string) => {
  const data = row.split(/,/);

  let [
    answerWord,
    questionData,
    imageOptions,
    soundOptions,
    appendixOptions,
  ] = data;

  answerWord = answerWord.replace(/&#44;/g, ',');

  const [
    questionType,
    question,
    questionSupplier,
    questionId,
    questionFallback,
  ] = questionData.split(/:/);

  const questionWord = questionType === 'question' ? question : questionType;

  let [imageSupplier, imageId, imageName, imageFallback] = imageOptions
    ? imageOptions.split(/:/)
    : [null, null, null, null];

  let [soundSupplier, soundId, soundName, soundFallback] = soundOptions
    ? soundOptions.split(/:/)
    : [null, null, null, null];

  const [appendix] = appendixOptions ? appendixOptions.split(/:/g) : [null];

  const fileName = generateFileName(answerWord);

  let imageFileName;
  let imageExt = '.jpg';
  if (imageSupplier === 'media') {
    imageName = imageId;
  } else if (/^(local|direct)$/.test(imageSupplier)) {
    imageFileName = imageId;
    imageExt = path.extname(imageFileName);
    if (!imageName) {
      imageName = path.basename(imageFileName, imageExt);
    }
  }

  if (!imageName) {
    imageName = fileName;
  }

  let soundExt = '.mp3';
  let soundFileName;
  if (/^(local|direct)$/.test(soundSupplier)) {
    soundFileName = soundId;
    soundExt = path.extname(soundFileName);
    if (!soundName) {
      soundName = path.basename(soundFileName, soundExt);
    }
  }

  if (!soundName) {
    soundName = fileName;
  }

  const jsonData: any = {
    frontImage: {
      supplier: imageSupplier,
      name: imageName,
      id: imageId,
      searchWord: answerWord,
      fallback: imageFallback,
    },
    backText: answerWord,
  };

  if (questionType === 'question') {
    // Use sound file instead of text
    jsonData.frontSound = {
      supplier: questionSupplier || 'google',
      searchWord: questionWord,
      name: generateFileName(questionWord),
      id: questionId,
      fallback: questionFallback,
    };
  } else {
    jsonData.frontText = questionWord;
  }

  // Only English (ascii) answers have the back sound for them
  if (/^[\x00-\x7F]+$/.test(answerWord)) {
    jsonData.backSound = {
      supplier: soundSupplier,
      id: soundId,
      name: soundName,
      searchWord: answerWord,
      fallback: soundFallback,
    };
  }

  if (appendix) {
    jsonData.backAppendix = appendix;
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
