"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function unsplash(page, searchWord, outDir, mediaDir, id) {
    return new Promise(async (resolve, reject) => {
        let url;
        let copyright;
        if (/wikimedia/.test(id)) {
            url = `https://${id}`;
            copyright = `<a href="${id}">Wikipedia</a>`;
        }
        else {
            url = `https://${encodeURI(id)}`;
        }
        resolve({ thumbUrl: url, soundUrl: url, copyright: copyright });
    });
}
exports.default = unsplash;
