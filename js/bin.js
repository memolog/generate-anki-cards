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
const main = () => {
    return new Promise(async (resolve, reject) => {
        program
            .version('1.0.0')
            .option('-i, --input <file')
            .option('-o, --output <file>')
            .option('-d, --dirname <directory>')
            .option('--media <string>', 'media directory to save images and sounds')
            .option('--parser <string>', 'CSV parser to use')
            .parse(process.argv);
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
        const dir = program.dirname || '.';
        const input = program.input || 'data.csv';
        const inputFile = path.resolve(process.cwd(), dir, input);
        const inputFileExt = path.extname(inputFile);
        let outDir;
        if (program.output) {
            outDir = path.resolve(process.cwd(), dir, program.output);
        }
        else {
            outDir = path.dirname(inputFile);
        }
        const dataCacheInstance = dataCache_1.DataCache.getInstance(outDir);
        const stream = fs.createReadStream(inputFile, 'utf8');
        stream.on('data', async (data) => {
            stream.pause();
            let jsonDataArray = [];
            const csvParserName = program.parser || 'default';
            if (inputFileExt === '.csv') {
                const csvParser = await Promise.resolve().then(() => require(path.resolve(__dirname, `csvParsers/${csvParserName}`)));
                jsonDataArray = csvParser.default(data);
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
                    const content = await fetchResource_1.default(page, jsonData, outDir, program.opts());
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
