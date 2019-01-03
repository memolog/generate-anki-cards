"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
function createImportFile(content, outDir, basename) {
    return new Promise((resolve, reject) => {
        const filePath = outDir || 'out';
        basename = basename ? `${basename}_` : '';
        fs.writeFile(`${filePath}/${basename}import.txt`, content, { flag: 'w+' }, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
exports.default = createImportFile;
