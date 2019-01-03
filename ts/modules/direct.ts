import * as puppeteer from 'puppeteer'; // eslint-disable-line

import {fetchResult} from '../typings'; // eslint-disable-line

export default function unsplash(
  page: puppeteer.Page,
  searchWord: string,
  outDir: string,
  mediaDir: string,
  id?: string
) {
  return new Promise<fetchResult>(async (resolve, reject) => {
    let url;
    let copyright;

    if (/wikimedia/.test(id)) {
      url = `https://${id}`;
      copyright = `<a href="${id}">Wikipedia</a>`;
    } else {
      url = `https://${encodeURI(id)}`;
    }

    resolve({thumbUrl: url, soundUrl: url, copyright: copyright});
  });
}
