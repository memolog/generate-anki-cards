"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function unsplash(page, searchWord, outDir, mediaDir, id) {
    return new Promise(async (resolve, reject) => {
        const encodedWord = decodeURIComponent(searchWord);
        const soundUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodedWord}&tl=en&total=1&idx=0&textlen=100`;
        const copyrightUrl = `https://translate.google.com/#view=home&op=translate&sl=en&tl=ja&text=${encodedWord}`;
        const copyright = `<a href="${copyrightUrl}">Google Translate</a>`;
        resolve({ soundUrl, copyright });
    });
}
exports.default = unsplash;
