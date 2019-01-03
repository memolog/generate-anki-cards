import * as puppeteer from 'puppeteer'; // eslint-disable-line
import {DataCache} from '../dataCache'; // eslint-disable-line
import {fetchResult} from '../typings'; // eslint-disable-line

export default function cambridge(
  page: puppeteer.Page,
  searchWord: string,
  outDir: string,
  mediaDir: string,
  id?: string
) {
  return new Promise<fetchResult>(async (resolve, reject) => {
    const host = 'https://dictionary.cambridge.org';
    searchWord = searchWord.replace(/\s/g, '-');
    const url = `${host}/dictionary/english/${searchWord}`;

    const dataCacheInstance = DataCache.getInstance();
    const dataCache = await dataCacheInstance.readData();

    if (dataCache[url]) {
      resolve(dataCache[url]);
      return;
    }

    await page.goto(url);

    let entryHandle;
    try {
      await page.waitForSelector('.entry', {
        timeout: 10000,
      });
      entryHandle = await page.$('.entry');
    } catch (err) {}

    if (!entryHandle) {
      resolve({});
      return;
    }

    const copyright = `<a href="${page.url()}">Cambridge Dictionary</a>`;

    try {
      let {thumbUrl, soundUrl, soundIPA} = await page.evaluate(
        (entry: Element) => {
          if (!entry) {
            return {};
          }
          const elements = entry.getElementsByClassName('img-thumb');
          const div = elements && elements[0];
          const images = div && div.getElementsByTagName('img');
          const image = images && images[0];

          let thumbUrl;
          if (image) {
            thumbUrl = image.getAttribute('data-image');
          }

          const span = entry.getElementsByClassName('us')[0];
          const audioButton =
            span && span.getElementsByClassName('audio_play_button')[0];

          if (!audioButton) {
            return {thumbUrl};
          }

          const soundIPAEls = span.getElementsByClassName('ipa');
          const soundIPAEl = soundIPAEls && soundIPAEls[0];
          const soundIPA = soundIPAEl ? soundIPAEl.textContent : null;
          const soundUrl = audioButton.getAttribute('data-src-mp3');

          return {thumbUrl, soundUrl, soundIPA};
        },
        entryHandle
      );

      entryHandle.dispose();

      if (thumbUrl) {
        thumbUrl = `${host}/${thumbUrl}`;
      }

      if (soundUrl) {
        soundUrl = `${host}/${soundUrl}`;
      }

      dataCache[url] = {thumbUrl, soundUrl, soundIPA, copyright};
      dataCacheInstance.updateCacheFile();

      resolve(dataCache[url]);
    } catch (err) {
      reject(err);
    }
  });
}
