import * as puppeteer from 'puppeteer'; // eslint-disable-line
import * as path from 'path';

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
    const host = 'https://unsplash.com';
    const dataCacheInstance = DataCache.getInstance();
    const dataCache = await dataCacheInstance.readData();

    searchWord = searchWord.replace(/\s/g, '-');
    const searchCache = dataCache[searchWord];
    id = id || (searchCache && searchCache.unsplash);

    let url;
    if (id) {
      url = `${host}/photos/${id}`;
    } else {
      url = `${host}/search/photos/${searchWord}`;
    }

    if (dataCache[url]) {
      resolve(dataCache[url]);
      return;
    }

    await page.goto(url);

    let imgHandles: puppeteer.ElementHandle[] = [];
    let imgHandle;

    if (id) {
      imgHandles = await page.$$('[data-test="photos-route"] img');
      imgHandle = imgHandles[1];
    } else {
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
      let {thumbUrl, imageUrl} = await page.evaluate((img: Element) => {
        if (!img) {
          return {};
        }
        const thumbUrl = img.getAttribute('src');
        const imageUrl = img.parentElement.parentElement.getAttribute('href');
        return {thumbUrl, imageUrl};
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

      dataCache[url] = {thumbUrl, copyright};
      dataCacheInstance.updateCacheFile();

      resolve(dataCache[url]);
    } catch (err) {
      console.log(err);
    }
  });
}
