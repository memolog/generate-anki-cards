#!/usr/bin/env node

'use strict;';

import * as program from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as util from 'util';

import fetchResouce from './fetchResource';
import createImportFile from './createImportFile';
import {DataCache} from './dataCache';

const main = () => {
  return new Promise(async (resolve, reject) => {
    program
      .version('1.0.0')
      .option('-i, --input <file')
      .option('-o, --output <file>')
      .option('--media <string>', 'media directory to save images and sounds')
      .option('--parser <string>', 'CSV parser to use')
      .parse(process.argv);

    if (!program.input || !program.output) {
      reject(new Error('Input or output files are required'));
      return;
    }

    let browser: puppeteer.Browser;
    let page: puppeteer.Page;
    try {
      browser = await puppeteer.launch();
      page = await browser.newPage();
    } catch (err) {
      reject(err);
      return;
    }

    const contents: string[] = [];
    const inputFile = path.resolve(process.cwd(), program.input);
    const inputFileExt = path.extname(inputFile);
    const outDir = path.resolve(process.cwd(), program.output);

    const dataCacheInstance = DataCache.getInstance(outDir);
    const stream = fs.createReadStream(inputFile, 'utf8');

    stream.on('data', async (data: string) => {
      stream.pause();

      let jsonDataArray = [];
      const csvParserName = program.parser || 'default';
      if (inputFileExt === '.csv') {
        const csvParser = await import(path.resolve(
          __dirname,
          `csvParsers/${csvParserName}`
        ));
        jsonDataArray = csvParser.default(data);
      } else {
        try {
          jsonDataArray = JSON.parse(data);
        } catch (err) {
          stream.destroy(err);
          return;
        }
      }

      for (const jsonData of jsonDataArray) {
        try {
          console.log(`---- ${jsonData.backText} ----`);
          const content = await fetchResouce(page, jsonData, program.opts());
          contents.push(content);
        } catch (err) {
          stream.destroy(err);
          break;
        }
      }

      try {
        await createImportFile(
          contents.join('\n'),
          outDir,
          path.basename(inputFile, inputFileExt)
        );

        await dataCacheInstance.updateCacheFile();

        await browser.close();
      } catch (err) {
        stream.destroy(err);
        return;
      }

      stream.resume();
    });

    stream.on('close', () => {
      resolve();
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
};

if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
}

module.exports = main;
