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
        const backSoundFileName = util_1.generateFileName(sentence);
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
