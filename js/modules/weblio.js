"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataCache_1 = require("../dataCache"); // eslint-disable-line
function unsplash(page, searchWord, outDir, mediaDir, id) {
    return new Promise(async (resolve, reject) => {
        const host = 'https://ejje.weblio.jp';
        const encodedWord = searchWord.replace(/\s/g, '+');
        const url = `${host}/content/${encodedWord}`;
        const dataCacheInstance = dataCache_1.DataCache.getInstance();
        const dataCache = await dataCacheInstance.readData();
        if (dataCache[url]) {
            resolve(dataCache[url]);
            return;
        }
        await page.goto(url);
        let entryHandle;
        try {
            await page.waitForSelector('#summary', {
                timeout: 10000,
            });
            entryHandle = await page.$('#summary');
        }
        catch (err) { }
        let soundUrl;
        let soundIPA;
        if (entryHandle) {
            [soundUrl, soundIPA] = await page.evaluate((entry) => {
                if (!entry) {
                    return [null, null];
                }
                const audioButton = entry.querySelector('#audioDownloadPlayUrl');
                if (!audioButton) {
                    return [null, null];
                }
                const soundIPAEls = entry.getElementsByClassName('phoneticEjjeDesc');
                const soundIPAEl = soundIPAEls && soundIPAEls[0];
                const soundIPA = soundIPAEl ? soundIPAEl.textContent : null;
                const soundUrl = audioButton.getAttribute('href');
                return [soundUrl, soundIPA];
            }, entryHandle);
            const copyright = `<a href="${url}">Weblio</a>`;
            dataCache[url] = { soundUrl, soundIPA, copyright };
            dataCacheInstance.updateCacheFile();
            resolve(dataCache[url]);
        }
    });
}
exports.default = unsplash;
