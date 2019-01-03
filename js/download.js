"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const mkdirp = require("mkdirp");
const https = require("https");
function download(url, name, ext, outDir, mediaDir) {
    return new Promise((resolve, reject) => {
        const dir = `${outDir}/${mediaDir}`;
        ext = ext.toLocaleLowerCase();
        mkdirp(dir, (err) => {
            if (err) {
                reject(err);
                return;
            }
            const file = fs.createWriteStream(`${dir}/${name}${ext}`);
            console.log(`download: ${url}`);
            https
                .get(url, (res) => {
                res.on('data', (d) => {
                    file.write(d);
                });
                res.on('end', () => {
                    resolve();
                });
            })
                .on('error', (e) => {
                console.error(e);
            });
        });
    });
}
exports.default = download;
