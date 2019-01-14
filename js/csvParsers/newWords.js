"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const csvRowToJSON = (row) => {
    const [word, translation, ...sentences] = row.split(/,/).map((r) => r.trim());
    const fileName = util_1.generateFileName(word);
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
        const backSoundFileName = util_1.generateFileName(sentence);
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
