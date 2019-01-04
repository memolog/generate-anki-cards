import * as puppeteer from 'puppeteer'; // eslint-disable-line
import * as path from 'path';

import download from './download';
import checkIfFileExists from './checkFileExists';
import {fetchModule, fetchResult} from './typings'; // eslint-disable-line

interface dataOptions {
  supplier?: string;
  fallback?: string;
  searchWord?: string;
  name?: string;
  id?: string;
}

interface options {
  mode?: string;
  output?: string;
  media?: string;
}

const arrayMap: {[key: string]: number} = {
  backText: 0,
  frontText: 1,
  frontImage: 2,
  frontSound: 3,
  frontSoundIPA: 4,
  frontAppendix: 5,
  backImage: 6,
  backSound: 7,
  backSoundIPA: 8,
  backAppendix: 9,
  copyright: 10,
};

export default async function fetchResource(
  page: puppeteer.Page,
  data: {
    [key: string]: string | dataOptions;
  },
  options?: options
) {
  return new Promise<string>(async (resolve, reject) => {
    const outDir = options.output
      ? path.resolve(process.cwd(), options.output)
      : 'out';
    const mediaDir = options.media ? options.media : 'media';

    const content = new Array(9);
    const imageCopyright: string[] = [];
    const soundCopyright: string[] = [];

    for (const key in data) {
      if (!data.hasOwnProperty(key)) {
        continue;
      }

      const dataOptions = data[key];
      if (!dataOptions) {
        continue;
      }

      if (/text|appendix/i.test(key)) {
        content[arrayMap[key]] = dataOptions;
        continue;
      }

      if (/image/i.test(key)) {
        if (typeof dataOptions === 'string') {
          continue;
        }
        const supplier = dataOptions.supplier || 'cambridge';
        if (supplier === 'none') {
          continue;
        }

        const searchWord = dataOptions.searchWord || '';

        const imageId = dataOptions.id;
        const imageFileName = /^(local|direct)$/.test(supplier)
          ? imageId
          : null;
        const imageExt = imageFileName ? path.extname(imageFileName) : '.jpg';

        const imageName =
          dataOptions.name ||
          (imageFileName ? path.basename(imageFileName, imageExt) : null) ||
          searchWord
            .replace(/\s/g, '_')
            .replace(/[^0-9a-zA-Z_]/g, '')
            .toLocaleLowerCase();

        let copyright;

        const modulePath = path.resolve(__dirname, `./modules/${supplier}`);
        const module: fetchModule = (await import(modulePath)).default;
        let result: fetchResult;
        try {
          result = await module(page, searchWord, outDir, mediaDir, imageId);
        } catch (err) {
          console.log(err);
        }
        if (!result.thumbUrl && !/local|media/.test(supplier)) {
          const fallback = dataOptions.fallback || 'unsplash';
          if (fallback) {
            const modulePath = path.resolve(__dirname, `./modules/${fallback}`);
            const module: fetchModule = (await import(modulePath)).default;
            result = await module(page, searchWord, outDir, mediaDir, imageId);
          }
        }

        const thumbUrl = result.thumbUrl;
        if (thumbUrl) {
          copyright = result.copyright;
          if (
            !(await checkIfFileExists(imageName, imageExt, outDir, mediaDir))
          ) {
            await download(thumbUrl, imageName, imageExt, outDir, mediaDir);
          }
        }

        const html = `<img src="${imageName}${imageExt}">`;
        content[arrayMap[key]] = html;
        if (copyright) {
          imageCopyright.push(copyright);
        }
        continue;
      }

      if (/sound/i.test(key)) {
        if (typeof dataOptions === 'string') {
          return;
        }
        const supplier = dataOptions.supplier || 'cambridge';
        if (supplier === 'none') {
          continue;
        }

        const searchWord = dataOptions.searchWord || '';
        const soundId = dataOptions.id;
        const soundFileName = /^(local|direct)$/.test(supplier)
          ? soundId
          : null;

        const soundExt = soundFileName ? path.extname(soundFileName) : '.mp3';
        const soundName =
          (soundFileName ? path.basename(soundFileName, soundExt) : null) ||
          searchWord
            .replace(/\s/g, '_')
            .replace(/[^0-9a-zA-Z_]/g, '')
            .toLocaleLowerCase();

        let copyright;
        let soundIPA;

        const modulePath = path.resolve(__dirname, `./modules/${supplier}`);
        const module: fetchModule = (await import(modulePath)).default;
        let result: fetchResult;
        try {
          result = await module(page, searchWord, outDir, mediaDir, soundId);
        } catch (err) {
          console.log(err);
        }
        if (!result.soundUrl && !/local|media/.test(supplier)) {
          const fallback = dataOptions.fallback || 'google';
          if (fallback) {
            const modulePath = path.resolve(__dirname, `./modules/${fallback}`);
            const module: fetchModule = (await import(modulePath)).default;
            result = await module(page, searchWord, outDir, mediaDir, soundId);
          }
        }

        const soundUrl = result.soundUrl;
        if (soundUrl) {
          copyright = result.copyright;
          soundIPA = result.soundIPA;
          if (
            !(await checkIfFileExists(soundName, soundExt, outDir, mediaDir))
          ) {
            await download(soundUrl, soundName, soundExt, outDir, mediaDir);
          }
        }

        const html = `[sound:${soundName}${soundExt}]`;
        if (/front/i.test(key)) {
          content[arrayMap.frontSoundIPA] = soundIPA;
        } else {
          content[arrayMap.backSoundIPA] = soundIPA;
        }
        content[arrayMap[key]] = html;
        if (copyright) {
          soundCopyright.push(copyright);
        }
        continue;
      }
    }

    let imageCopyrightContent = '';
    if (imageCopyright.length) {
      imageCopyrightContent += 'Image from ';
      imageCopyright.forEach((copyright, index) => {
        imageCopyrightContent += copyright;
        const len = imageCopyright.length;
        if (len > 1) {
          if (index < len - 2) {
            imageCopyrightContent += ', ';
          } else if (index === len - 2) {
            imageCopyrightContent += ' and ';
          }
        }
      });
    }

    let soundCopyrightContent = '';
    if (soundCopyright.length) {
      soundCopyrightContent += 'Sound from ';
      soundCopyright.forEach((copyright, index) => {
        soundCopyrightContent += copyright;
        const len = soundCopyright.length;
        if (len > 1) {
          if (index > len - 2) {
            soundCopyrightContent += ', ';
          } else if (index === len - 2) {
            soundCopyrightContent += ' and ';
          }
        }
      });
    }

    content[arrayMap.copyright] = imageCopyrightContent;
    if (imageCopyrightContent && soundCopyrightContent) {
      content[arrayMap.copyright] += '<br>';
    }
    content[arrayMap.copyright] += soundCopyrightContent;

    resolve(content.join(';'));
  });
}