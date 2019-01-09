"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const download_1 = require("./download");
const checkFileExists_1 = require("./checkFileExists");
const arrayMap = {
    backText: 0,
    frontText: 1,
    frontImage: 2,
    frontSound: 3,
    frontSoundIPA: 4,
    frontAppendix: 5,
    backImage: 6,
    backSound: 7,
    backSoundIPA: 8,
    backAppendix: 9,
    copyright: 10,
};
async function fetchResource(page, data, outDir, options) {
    return new Promise(async (resolve, reject) => {
        const mediaDir = options.media ? options.media : 'media';
        const content = new Array(9);
        const imageCopyright = [];
        const soundCopyright = [];
        for (const key in data) {
            if (!data.hasOwnProperty(key)) {
                continue;
            }
            const dataOptions = data[key];
            if (!dataOptions) {
                continue;
            }
            if (/text|appendix/i.test(key)) {
                content[arrayMap[key]] = dataOptions;
                continue;
            }
            if (/image/i.test(key)) {
                if (typeof dataOptions === 'string') {
                    continue;
                }
                const supplier = dataOptions.supplier || 'cambridge';
                if (supplier === 'none') {
                    continue;
                }
                const searchWord = dataOptions.searchWord || '';
                const imageId = dataOptions.id;
                const imageFileName = /^(local|direct)$/.test(supplier)
                    ? imageId
                    : null;
                const imageExt = imageFileName ? path.extname(imageFileName) : '.jpg';
                const imageName = dataOptions.name ||
                    (imageFileName ? path.basename(imageFileName, imageExt) : null) ||
                    searchWord
                        .replace(/\s/g, '_')
                        .replace(/[^0-9a-zA-Z_]/g, '')
                        .toLocaleLowerCase();
                let copyright;
                const modulePath = path.resolve(__dirname, `./modules/${supplier}`);
                const module = (await Promise.resolve().then(() => require(modulePath))).default;
                let result;
                const fetchOptions = {
                    page,
                    searchWord,
                    outDir,
                    mediaDir,
                    id: imageId,
                    name: imageName,
                    ext: imageExt,
                };
                try {
                    result = await module(fetchOptions);
                }
                catch (err) {
                    console.log(err);
                }
                if (!result.thumbUrl && !result.downloaded && !/media/.test(supplier)) {
                    const fallback = dataOptions.fallback || 'unsplash';
                    if (fallback && fallback !== 'none') {
                        const modulePath = path.resolve(__dirname, `./modules/${fallback}`);
                        const module = (await Promise.resolve().then(() => require(modulePath))).default;
                        result = await module(fetchOptions);
                    }
                }
                const thumbUrl = result.thumbUrl;
                if (thumbUrl) {
                    copyright = result.copyright;
                    if (!(await checkFileExists_1.default(imageName, imageExt, outDir, mediaDir))) {
                        await download_1.default(thumbUrl, imageName, imageExt, outDir, mediaDir);
                    }
                }
                const html = `<img src="${imageName}${imageExt}">`;
                content[arrayMap[key]] = html;
                if (copyright) {
                    imageCopyright.push(copyright);
                }
                continue;
            }
            if (/sound/i.test(key)) {
                if (typeof dataOptions === 'string') {
                    return;
                }
                const supplier = dataOptions.supplier || 'cambridge';
                if (supplier === 'none') {
                    continue;
                }
                const searchWord = dataOptions.searchWord || '';
                const soundId = dataOptions.id;
                const soundFileName = /^(local|direct)$/.test(supplier)
                    ? soundId
                    : null;
                const soundExt = soundFileName ? path.extname(soundFileName) : '.mp3';
                const soundName = dataOptions.name ||
                    (soundFileName ? path.basename(soundFileName, soundExt) : null) ||
                    searchWord
                        .replace(/\s/g, '_')
                        .replace(/[^0-9a-zA-Z_]/g, '')
                        .toLocaleLowerCase();
                let copyright;
                let soundIPA;
                const modulePath = path.resolve(__dirname, `./modules/${supplier}`);
                const module = (await Promise.resolve().then(() => require(modulePath))).default;
                let result;
                const fetchOptions = {
                    page,
                    searchWord,
                    outDir,
                    mediaDir,
                    id: soundId,
                    name: soundName,
                    ext: soundExt,
                };
                try {
                    result = await module(fetchOptions);
                }
                catch (err) {
                    console.log(err);
                }
                if (!result.soundUrl && !result.downloaded && !/media/.test(supplier)) {
                    const fallback = dataOptions.fallback || 'google';
                    if (fallback && fallback !== 'none') {
                        const modulePath = path.resolve(__dirname, `./modules/${fallback}`);
                        const module = (await Promise.resolve().then(() => require(modulePath))).default;
                        result = await module(fetchOptions);
                    }
                }
                const soundUrl = result.soundUrl;
                if (result.copyright) {
                    copyright = result.copyright;
                }
                if (result.soundIPA) {
                    soundIPA = result.soundIPA;
                }
                if (soundUrl) {
                    if (!(await checkFileExists_1.default(soundName, soundExt, outDir, mediaDir))) {
                        await download_1.default(soundUrl, soundName, soundExt, outDir, mediaDir);
                    }
                }
                const html = `[sound:${soundName}${soundExt}]`;
                if (/front/i.test(key)) {
                    content[arrayMap.frontSoundIPA] = soundIPA;
                }
                else {
                    content[arrayMap.backSoundIPA] = soundIPA;
                }
                content[arrayMap[key]] = html;
                if (copyright) {
                    soundCopyright.push(copyright);
                }
                continue;
            }
        }
        let imageCopyrightContent = '';
        if (imageCopyright.length) {
            imageCopyrightContent += 'Image from ';
            imageCopyright.forEach((copyright, index) => {
                imageCopyrightContent += copyright;
                const len = imageCopyright.length;
                if (len > 1) {
                    if (index < len - 2) {
                        imageCopyrightContent += ', ';
                    }
                    else if (index === len - 2) {
                        imageCopyrightContent += ' and ';
                    }
                }
            });
        }
        let soundCopyrightContent = '';
        if (soundCopyright.length) {
            soundCopyrightContent += 'Sound from ';
            soundCopyright.forEach((copyright, index) => {
                soundCopyrightContent += copyright;
                const len = soundCopyright.length;
                if (len > 1) {
                    if (index > len - 2) {
                        soundCopyrightContent += ', ';
                    }
                    else if (index === len - 2) {
                        soundCopyrightContent += ' and ';
                    }
                }
            });
        }
        content[arrayMap.copyright] = imageCopyrightContent;
        if (imageCopyrightContent && soundCopyrightContent) {
            content[arrayMap.copyright] += '<br>';
        }
        content[arrayMap.copyright] += soundCopyrightContent;
        resolve(content.join(';'));
    });
}
exports.default = fetchResource;
