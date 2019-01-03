import * as puppeteer from 'puppeteer'; // eslint-disable-line

import {DataCache} from '../dataCache'; // eslint-disable-line
import {fetchResult} from '../typings'; // eslint-disable-line

export default function unsplash(
  page: puppeteer.Page,
  searchWord: string,
  outDir: string,
  mediaDir: string,
  id?: string
) {
  return new Promise<fetchResult>(async (resolve, reject) => {
    const encodedWord = decodeURIComponent(searchWord);

    const soundUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodedWord}&tl=en&total=1&idx=0&textlen=100`;
    const copyrightUrl = `https://translate.google.com/#view=home&op=translate&sl=en&tl=ja&text=${encodedWord}`;
    const copyright = `<a href="${copyrightUrl}">Google Translate</a>`;

    resolve({soundUrl, copyright});
  });
}
