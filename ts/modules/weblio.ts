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
    const host = 'https://ejje.weblio.jp';
    const encodedWord = searchWord.replace(/\s/g, '+');
    const url = `${host}/content/${encodedWord}`;

    const dataCacheInstance = DataCache.getInstance();
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
    } catch (err) {}

    let soundUrl;
    let soundIPA;
    if (entryHandle) {
      [soundUrl, soundIPA] = await page.evaluate((entry: Element) => {
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

      dataCache[url] = {soundUrl, soundIPA, copyright};
      dataCacheInstance.updateCacheFile();

      resolve(dataCache[url]);
    }
  });
}
