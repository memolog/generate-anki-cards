"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const checkFileExists_1 = require("../checkFileExists");
function unsplash(options) {
    return new Promise(async (resolve, reject) => {
        const { outDir, mediaDir, id } = options;
        const resoucePath = `${outDir}/local/${id}`;
        const distPath = `${outDir}/${mediaDir}/${id}`;
        const distExt = path.extname(distPath);
        const distName = path.basename(distPath, distExt);
        if (await checkFileExists_1.default(distName, distExt, outDir, mediaDir)) {
            resolve({});
            return;
        }
        fs.copyFile(resoucePath, distPath, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({});
        });
    });
}
exports.default = unsplash;
