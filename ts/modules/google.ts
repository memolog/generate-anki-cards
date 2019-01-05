import * as puppeteer from 'puppeteer'; // eslint-disable-line

import {DataCache} from '../dataCache'; // eslint-disable-line
import {fetchResult} from '../typings'; // eslint-disable-line

import * as textToSpeech from '@google-cloud/text-to-speech';

export default function unsplash(
  page: puppeteer.Page,
  searchWord: string,
  outDir: string,
  mediaDir: string,
  id?: string,
  config?: any
) {
  return new Promise<fetchResult>(async (resolve, reject) => {
    const textToSpeechAPIKehy =
      config.google && config.google.textToSpeechApiKey;

    let soundUrl;
    let copyright;

    if (textToSpeechApiKey) {
      const request = {
        input: {text: searchWord},
        voice: {
          languageCode: 'en-US',
          ssmGender: 'NEUTRAL',
        },
        audioConfig: 'MP3',
      };

      const client = new textToSpeech.TextToSpeechClient();
      const [response] = await client.synthesizeSpeech(request);
    } else {
      const encodedWord = decodeURIComponent(searchWord);

      const soundUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodedWord}&tl=en&total=1&idx=0&textlen=100`;
      const copyrightUrl = `https://translate.google.com/#view=home&op=translate&sl=en&tl=ja&text=${encodedWord}`;
      const copyright = `<a href="${copyrightUrl}">Google Translate</a>`;
    }

    resolve({soundUrl, copyright});
  });
}
