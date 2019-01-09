import * as puppeteer from 'puppeteer'; // eslint-disable-line
import * as fs from 'fs';
import * as path from 'path';

import {DataCache} from '../dataCache'; // eslint-disable-line
import {fetchResult, fetchOptions} from '../typings'; // eslint-disable-line
import checkIfFileExists from '../checkFileExists';

export default function unsplash(options: fetchOptions) {
  return new Promise<fetchResult>(async (resolve, reject) => {
    const {outDir, mediaDir, id, name, ext} = options;
    const resoucePath = `${outDir}/local/${id}`;
    const distPath = `${outDir}/${mediaDir}/${name}${ext}`;
    const distExt = path.extname(distPath);
    const distName = path.basename(distPath, distExt);
    const downloaded = true;
    if (await checkIfFileExists(distName, distExt, outDir, mediaDir)) {
      resolve({downloaded});
      return;
    }
    fs.copyFile(resoucePath, distPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({downloaded});
    });
  });
}
