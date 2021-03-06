"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const dataCache_1 = require("../dataCache"); // eslint-disable-line
function unsplash(options) {
    return new Promise(async (resolve, reject) => {
        let { page, searchWord, id } = options;
        const host = 'https://unsplash.com';
        const dataCacheInstance = dataCache_1.DataCache.getInstance();
        const dataCache = await dataCacheInstance.readData();
        searchWord = searchWord.replace(/\s/g, '-');
        const searchCache = dataCache[searchWord];
        id = id || (searchCache && searchCache.unsplash);
        let url;
        if (id) {
            url = `${host}/photos/${id}`;
        }
        else {
            url = `${host}/search/photos/${searchWord}`;
        }
        if (dataCache[url]) {
            resolve(dataCache[url]);
            return;
        }
        await page.goto(url);
        let imgHandles = [];
        let imgHandle;
        if (id) {
            imgHandles = await page.$$('[data-test="photos-route"] img');
            imgHandle = imgHandles[1];
        }
        else {
            imgHandles = await page.$$('figure img');
            if (!imgHandles && !imgHandles.length) {
                resolve({});
                return;
            }
            imgHandle = imgHandles[0];
        }
        if (!imgHandle) {
            resolve({});
            return;
        }
        try {
            let { thumbUrl, imageUrl } = await page.evaluate((img) => {
                if (!img) {
                    return {};
                }
                const thumbUrl = img.getAttribute('src');
                const imageUrl = img.parentElement.parentElement.getAttribute('href');
                return { thumbUrl, imageUrl };
            }, imgHandle);
            imgHandles.forEach((handle) => {
                handle.dispose();
            });
            let copyright;
            if (thumbUrl) {
                thumbUrl = thumbUrl.replace(/auto=format/, 'fm=jpg');
                if (!imageUrl) {
                    imageUrl = page.url();
                }
                if (!/^https?::/.test(imageUrl)) {
                    imageUrl = `${host}${imageUrl}`;
                }
                copyright = `<a href="${imageUrl}">Unsplash</a>`;
                if (!id) {
                    dataCache[searchWord] = dataCache[searchWord] || {};
                    dataCache[searchWord].unsplash = path.basename(imageUrl);
                }
            }
            dataCache[url] = { thumbUrl, copyright };
            dataCacheInstance.updateCacheFile();
            resolve(dataCache[url]);
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = unsplash;
