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
        const request = {
          input: {text: searchWord},
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

        await writeFile(
          `${outDir}/${mediaDir}/${name}${ext}`,
          response.audioContent,
          'binary'
        );
      }

      downloaded = true;
    } else {
      const encodedWord = decodeURIComponent(searchWord);

      const soundUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodedWord}&tl=en&total=1&idx=0&textlen=100`;
      const copyrightUrl = `https://translate.google.com/#view=home&op=translate&sl=en&tl=ja&text=${encodedWord}`;
      const copyright = `<a href="${copyrightUrl}">Google Translate</a>`;
    }

    resolve({soundUrl, copyright, downloaded});
  });
}
