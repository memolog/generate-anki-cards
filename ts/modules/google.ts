import * as puppeteer from 'puppeteer'; // eslint-disable-line

import {DataCache} from '../dataCache'; // eslint-disable-line
import {fetchResult} from '../typings'; // eslint-disable-line

import * as textToSpeech from '@google-cloud/text-to-speech';
import * as fs from 'fs';
import * as util from 'util';
import {fetchOptions} from '../typings'; // eslint-disable-line
import checkIfFileExists from '../checkFileExists';

export default function unsplash(options: fetchOptions) {
  return new Promise<fetchResult>(async (resolve, reject) => {
    const {searchWord, outDir, mediaDir, name} = options;
    const ext = '.mp3';

    let soundUrl;
    let copyright;
    let downloaded;

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      if (!(await checkIfFileExists(name, ext, outDir, mediaDir))) {
        console.log('download audio file from google text-to-speech API');
        const request: any = {
          voice: {
            languageCode: 'en-US',
            ssmGender: 'NEUTRAL',
          },
          audioConfig: {
            audioEncoding: 'MP3',
          },
        };

        // Simple check the text is written in a ssml format or not.
        if (/^<speak>.+<\/speak>$/.test(searchWord)) {
          request.input = {ssml: searchWord};
        } else {
          request.input = {text: searchWord};
        }

        const client = new textToSpeech.TextToSpeechClient();
        const [response] = await client.synthesizeSpeech(request);
        const writeFile = util.promisify(fs.writeFile);

        await writeFile(
          `${outDir}/${mediaDir}/${name}${ext}`,
          response.audioContent,
          'binary'
        );
      }

      const copyrightUrl = 'https://cloud.google.com/text-to-speech/';
      copyright = `<a href="${copyrightUrl}">Cloud Text-to-Speech</a>`;

      downloaded = true;
    } else {
      const encodedWord = decodeURIComponent(searchWord);

      soundUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodedWord}&tl=en&total=1&idx=0&textlen=100`;
      const copyrightUrl = `https://translate.google.com/#view=home&op=translate&sl=en&tl=ja&text=${encodedWord}`;
      copyright = `<a href="${copyrightUrl}">Google Translate</a>`;
    }

    resolve({soundUrl, copyright, downloaded});
  });
}
