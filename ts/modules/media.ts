import * as puppeteer from 'puppeteer'; // eslint-disable-line

import {fetchResult, fetchOptions} from '../typings'; // eslint-disable-line

export default function unsplash(options: fetchOptions) {
  return new Promise<fetchResult>(async (resolve, reject) => {
    resolve({});
  });
}
