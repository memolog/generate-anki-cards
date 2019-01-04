#!/usr/bin/env node
'use strict;';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const fetchResource_1 = require("./fetchResource");
const createImportFile_1 = require("./createImportFile");
const dataCache_1 = require("./dataCache");
const csvRowToJSON_1 = require("./csvRowToJSON");
const main = () => {
    return new Promise(async (resolve, reject) => {
        program
            .version('1.0.0')
            .option('-i, --input <file')
            .option('-o, --output <file>')
            .option('--media <string>', 'media directory to save images and sounds')
            .parse(process.argv);
        if (!program.input || !program.output) {
            reject(new Error('Input or output files are required'));
            return;
        }
        let browser;
        let page;
        try {
            browser = await puppeteer.launch();
            page = await browser.newPage();
        }
        catch (err) {
            reject(err);
            return;
        }
        const contents = [];
        const inputFile = path.resolve(process.cwd(), program.input);
        const inputFileExt = path.extname(inputFile);
        const outDir = path.resolve(process.cwd(), program.output);
        const dataCacheInstance = dataCache_1.DataCache.getInstance(outDir);
        const stream = fs.createReadStream(inputFile, 'utf8');
        stream.on('data', async (data) => {
            stream.pause();
            let jsonDataArray = [];
            if (inputFileExt === '.csv') {
                const rows = data.split(/\n/);
                for (const row of rows) {
                    // skip blank line
                    if (!row) {
                        continue;
                    }
                    jsonDataArray.push(csvRowToJSON_1.default(row));
                }
            }
            else {
                try {
                    jsonDataArray = JSON.parse(data);
                }
                catch (err) {
                    stream.destroy(err);
                    return;
                }
            }
            for (const jsonData of jsonDataArray) {
                try {
                    console.log(`---- ${jsonData.backText} ----`);
                    const content = await fetchResource_1.default(page, jsonData, program.opts());
                    contents.push(content);
                }
                catch (err) {
                    stream.destroy(err);
                    break;
                }
            }
            try {
                await createImportFile_1.default(contents.join('\n'), outDir, path.basename(inputFile, inputFileExt));
                await dataCacheInstance.updateCacheFile();
                await browser.close();
            }
            catch (err) {
                stream.destroy(err);
                return;
            }
            stream.resume();
        });
        stream.on('close', () => {
            resolve();
        });
        stream.on('error', (err) => {
            reject(err);
        });
    });
};
if (require.main === module) {
    main()
        .then(() => {
        process.exit(0);
    })
        .catch((err) => {
        console.log(err);
        process.exit(1);
    });
}
module.exports = main;
