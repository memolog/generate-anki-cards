"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const generateFileName = (fileName) => {
    return fileName
        .replace(/\s/g, '_')
        .replace(/[^0-9a-zA-Z_]/g, '')
        .toLocaleLowerCase();
};
const csvRowToJSON = (row) => {
    const data = row.split(/,/);
    let [answerWord, questionData, imageOptions, soundOptions, appendixOptions,] = data;
    answerWord = answerWord.replace(/&#44;/g, ',');
    const [questionType, question, questionSupplier, questionId,] = questionData.split(/:/);
    const questionWord = questionType === 'question' ? question : questionType;
    let [imageSupplier, imageId, imageName] = imageOptions
        ? imageOptions.split(/:/)
        : [null, null, null];
    const [soundSupplier, soundId] = soundOptions
        ? soundOptions.split(/:/)
        : [null, null];
    const [appendix] = appendixOptions ? appendixOptions.split(/:/g) : [null];
    const fileName = generateFileName(answerWord);
    let imageFileName;
    let imageExt = '.jpg';
    if (imageSupplier === 'media') {
        imageName = imageId;
    }
    else if (/^(local|direct)$/.test(imageSupplier)) {
        imageFileName = imageId;
        imageExt = path.extname(imageFileName);
        if (!imageName) {
            imageName = path.basename(imageFileName, imageExt);
        }
    }
    if (!imageName) {
        imageName = fileName;
    }
    let soundName;
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
    const jsonData = {
        frontImage: {
            supplier: imageSupplier,
            name: imageName,
            id: imageId,
            searchWord: answerWord,
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
        };
    }
    else {
        jsonData.frontText = questionWord;
    }
    // Only English (ascii) answers have the back sound for them
    if (/^[\x00-\x7F]+$/.test(answerWord)) {
        jsonData.backSound = {
            supplier: soundSupplier,
            id: soundId,
            name: soundName,
            searchWord: answerWord,
        };
    }
    if (appendix) {
        jsonData.backAppendix = appendix;
    }
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
