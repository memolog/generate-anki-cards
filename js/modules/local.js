"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const checkFileExists_1 = require("../checkFileExists");
function unsplash(options) {
    return new Promise(async (resolve, reject) => {
        const { outDir, mediaDir, id, name, ext } = options;
        const resoucePath = `${outDir}/local/${id}`;
        const distPath = `${outDir}/${mediaDir}/${name}${ext}`;
        const distExt = path.extname(distPath);
        const distName = path.basename(distPath, distExt);
        const downloaded = true;
        if (await checkFileExists_1.default(distName, distExt, outDir, mediaDir)) {
            resolve({ downloaded });
            return;
        }
        fs.copyFile(resoucePath, distPath, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({ downloaded });
        });
    });
}
exports.default = unsplash;
