"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
const util = require("util");
const checkFileExists_1 = require("../checkFileExists");
function unsplash(options) {
    return new Promise(async (resolve, reject) => {
        const { searchWord, outDir, mediaDir, name } = options;
        const ext = '.mp3';
        let soundUrl;
        let copyright;
        let downloaded;
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            if (!(await checkFileExists_1.default(name, ext, outDir, mediaDir))) {
                console.log('download audio file from google text-to-speech API');
                const request = {
                    input: { text: searchWord },
                    voice: {
                        languageCode: 'en-US',
                        ssmGender: 'NEUTRAL',
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                    },
                };
                const client = new textToSpeech.TextToSpeechClient();
                const [response] = await client.synthesizeSpeech(request);
                const writeFile = util.promisify(fs.writeFile);
                await writeFile(`${outDir}/${mediaDir}/${name}${ext}`, response.audioContent, 'binary');
            }
            const copyrightUrl = 'https://cloud.google.com/text-to-speech/';
            copyright = `<a href="${copyrightUrl}">Cloud Text-to-Speech</a>`;
            downloaded = true;
        }
        else {
            const encodedWord = decodeURIComponent(searchWord);
            soundUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodedWord}&tl=en&total=1&idx=0&textlen=100`;
            const copyrightUrl = `https://translate.google.com/#view=home&op=translate&sl=en&tl=ja&text=${encodedWord}`;
            copyright = `<a href="${copyrightUrl}">Google Translate</a>`;
        }
        resolve({ soundUrl, copyright, downloaded });
    });
}
exports.default = unsplash;
