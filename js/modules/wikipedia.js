"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataCache_1 = require("../dataCache"); // eslint-disable-line
function unsplash(options) {
    return new Promise(async (resolve, reject) => {
        const { page, searchWord } = options;
        const host = 'https://ja.wikipedia.org';
        const encodedWord = encodeURI(searchWord);
        const dataCacheInstance = dataCache_1.DataCache.getInstance();
        const dataCache = await dataCacheInstance.readData();
        const url = `${host}/wiki/${encodedWord}`;
        if (dataCache[url]) {
            resolve(dataCache[url]);
            return;
        }
        await page.goto(url);
        let entryHandle;
        try {
            await page.waitForSelector('.infobox img', {
                timeout: 10000,
            });
            entryHandle = await page.$('.infobox img');
        }
        catch (err) { }
        if (!entryHandle) {
            resolve({});
            return;
        }
        const copyright = `<a href="${page.url()}">Wikipedia</a>`;
        try {
            let thumbUrl = await page.evaluate((entry) => {
                if (!entry) {
                    return;
                }
                return entry.getAttribute('src').replace(/[0-9]+px-/, '1000px-');
            }, entryHandle);
            entryHandle.dispose();
            if (thumbUrl) {
                thumbUrl = `https:${thumbUrl}`;
            }
            dataCache[url] = { thumbUrl, copyright };
            dataCacheInstance.updateCacheFile();
            resolve(dataCache[url]);
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.default = unsplash;
