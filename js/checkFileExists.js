"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
function checkIfFileExists(name, ext, outDir, mediaDir) {
    return new Promise((resolve, reject) => {
        fs.access(`${outDir}/${mediaDir}/${name}${ext}`, (err) => {
            resolve(!err);
        });
    });
}
exports.default = checkIfFileExists;
