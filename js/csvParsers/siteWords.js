"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateFileName = (fileName) => {
    return fileName
        .replace(/\s/g, '_')
        .replace(/[^0-9a-zA-Z_]/g, '')
        .toLocaleLowerCase();
};
const csvRowToJSON = (word) => {
    const fileName = generateFileName(word);
    const jsonData = {
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
function defaultCsvParser(data) {
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
exports.default = defaultCsvParser;
