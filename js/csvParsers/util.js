"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateFileName(fileName) {
    return fileName
        .replace(/<[^>]+>([^<]*)<\/[^>]+>/, '$1')
        .replace(/\s/g, '_')
        .replace(/[^0-9a-zA-Z_]/g, '')
        .toLocaleLowerCase();
}
exports.generateFileName = generateFileName;
