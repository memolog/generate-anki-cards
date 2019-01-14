#!/usr/bin/env node

'use strict;';

import * as program from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

import fetchResouce from './fetchResource';
import createImportFile from './createImportFile';
import {DataCache} from './dataCache';

const main = () => {
  return new Promise(async (resolve, reject) => {
    program
      .version('1.0.0')
      .option('-i, --input <file')
      .option('-o, --output <file>')
      .option('-d, --dirname <directory>')
      .option('--media <string>', 'media directory to save images and sounds')
      .option('--parser <string>', 'CSV parser to use')
      .parse(process.argv);

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

    const dir = program.dirname || '.';
    const input = program.input || 'data.csv';

    const inputFile = path.resolve(process.cwd(), dir, input);
    const inputFileExt = path.extname(inputFile);

    let outDir;
    if (program.output) {
      outDir = path.resolve(process.cwd(), dir, program.output);
    } else {
      outDir = path.dirname(inputFile);
    }

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
          const content = await fetchResouce(
            page,
            jsonData,
            outDir,
            program.opts()
          );
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
