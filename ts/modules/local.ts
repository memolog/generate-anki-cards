import * as puppeteer from 'puppeteer'; // eslint-disable-line
import * as fs from 'fs';
import * as path from 'path';

import {DataCache} from '../dataCache'; // eslint-disable-line
import {fetchResult} from '../typings'; // eslint-disable-line
import checkIfFileExists from '../checkFileExists';

export default function unsplash(
  page: puppeteer.Page,
  searchWord: string,
  outDir: string,
  mediaDir: string,
  id?: string
) {
  return new Promise<fetchResult>(async (resolve, reject) => {
    const resoucePath = `${outDir}/local/${id}`;
    const distPath = `${outDir}/${mediaDir}/${id}`;
    const distExt = path.extname(distPath);
    const distName = path.basename(distPath, distExt);
    if (await checkIfFileExists(distName, distExt, outDir, mediaDir)) {
      resolve({});
      return;
    }
    fs.copyFile(resoucePath, distPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({});
    });
  });
}
