import * as puppeteer from 'puppeteer'; // eslint-disable-line

export interface fetchResult {
  thumbUrl?: string;
  soundUrl?: string;
  soundIPA?: string;
  copyright?: string;
}

export interface fetchModule {
  (
    page: puppeteer.Page,
    searchWord: string,
    outDir: string,
    mediaDir: string,
    id?: string
  ): Promise<fetchResult>;
}
