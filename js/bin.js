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
            .option('--mode <string>')
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
        const mode = program.mode || 'english';
        const dataCacheInstance = dataCache_1.DataCache.getInstance(outDir);
        const stream = fs.createReadStream(inputFile, 'utf8');
        stream.on('data', async (datas) => {
            stream.pause();
            if (inputFileExt === '.csv') {
                const data = datas.split(/\n/);
                for (const d of data) {
                    const dataArray = d.split(/,/);
                    if (dataArray.length < 2) {
                        continue;
                    }
                    let jsonData;
                    if (mode === 'english') {
                        let [english, questionData, imageOptions, soundOptions, appendixOptions,] = dataArray;
                        english = english.replace(/&#44;/g, ',');
                        console.log(`---- ${english} ----`);
                        const [questionType, question, questionSupplier, questionId,] = questionData.split(/:/);
                        const word = questionType === 'question' ? question : questionType;
                        let [imageSupplier, imageId, imageName] = imageOptions
                            ? imageOptions.split(/:/)
                            : [null, null, null, null, null];
                        const [soundSupplier, soundId] = soundOptions
                            ? soundOptions.split(/:/)
                            : [null, null];
                        const [appendix] = appendixOptions
                            ? appendixOptions.split(/:/g)
                            : [null];
                        const fileName = english
                            .replace(/\s/g, '_')
                            .replace(/[^0-9a-zA-Z_]/g, '')
                            .toLocaleLowerCase();
                        const imageFileName = /^(local|direct)$/.test(imageSupplier)
                            ? imageId
                            : null;
                        const imageExt = imageFileName
                            ? path.extname(imageFileName)
                            : '.jpg';
                        if (imageSupplier === 'media') {
                            imageName = imageId;
                        }
                        imageName =
                            imageName ||
                                (imageFileName ? path.basename(imageFileName, imageExt) : null) ||
                                fileName;
                        const soundFileName = /^(local|direct)$/.test(soundSupplier)
                            ? soundId
                            : null;
                        const soundExt = soundFileName
                            ? path.extname(soundFileName)
                            : '.mp3';
                        const soundName = (soundFileName ? path.basename(soundFileName, soundExt) : null) ||
                            fileName;
                        jsonData = {
                            frontText: questionType === 'question' ? null : word,
                            frontSound: questionType === 'question'
                                ? {
                                    supplier: questionSupplier || 'google',
                                    searchWord: word,
                                    name: word
                                        .replace(/\s/g, '_')
                                        .replace(/[^0-9a-zA-Z_]/g, '')
                                        .toLocaleLowerCase(),
                                    id: questionId,
                                }
                                : null,
                            frontImage: {
                                supplier: imageSupplier,
                                name: imageName,
                                id: imageId,
                                searchWord: english,
                            },
                            backText: english,
                            backSound: {
                                supplier: soundSupplier,
                                id: soundId,
                                name: soundName,
                                searchWord: english,
                            },
                            backAppendix: appendix,
                        };
                    }
                    else if (mode === 'living-object') {
                        const [word, questionData, imageOptions, appendixOptions,] = dataArray;
                        const [question] = questionData.split(/:/);
                        console.log(`---- ${word} ----`);
                        let [imageSupplier, imageId, imageName] = imageOptions
                            ? imageOptions.split(/:/)
                            : [null, null, null, null, null];
                        const [appendix] = appendixOptions
                            ? appendixOptions.split(/:/g)
                            : [null];
                        const imageFileName = /^(local|direct)$/.test(imageSupplier)
                            ? imageId
                            : null;
                        const imageExt = imageFileName
                            ? path.extname(imageFileName).toLocaleLowerCase()
                            : '.jpg';
                        imageName =
                            imageName ||
                                (imageFileName ? path.basename(imageFileName, imageExt) : null) ||
                                word;
                        jsonData = {
                            frontText: question,
                            frontImage: {
                                supplier: imageSupplier || 'wikipedia',
                                name: imageName,
                                id: imageId,
                                searchWord: word,
                            },
                            backText: word,
                            backAppendix: appendix,
                        };
                    }
                    try {
                        const content = await fetchResource_1.default(page, jsonData, program.opts());
                        contents.push(content);
                    }
                    catch (err) {
                        stream.destroy(err);
                        break;
                    }
                }
            }
            else {
                let jsonDatas;
                try {
                    jsonDatas = JSON.parse(datas);
                }
                catch (err) {
                    stream.destroy(err);
                    return;
                }
                for (const jsonData of jsonDatas) {
                    try {
                        const content = await fetchResource_1.default(page, jsonData, program.opts());
                        contents.push(content);
                    }
                    catch (err) {
                        stream.destroy(err);
                        break;
                    }
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
