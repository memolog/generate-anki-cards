import * as puppeteer from 'puppeteer'; // eslint-disable-line

import {fetchResult, fetchOptions} from '../typings'; // eslint-disable-line

export default function unsplash(options: fetchOptions) {
  return new Promise<fetchResult>(async (resolve, reject) => {
    const {id} = options;

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
