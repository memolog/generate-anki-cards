"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const csvRowToJSON = (row) => {
    const [japanese, ...sentences] = row.split(/,/).map((r) => r.trim());
    const english = sentences.join(', ');
    const fileName = util_1.generateFileName(english);
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
