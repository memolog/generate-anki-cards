import * as puppeteer from 'puppeteer'; // eslint-disable-line

export interface fetchResult {
  thumbUrl?: string;
  soundUrl?: string;
  soundIPA?: string;
  copyright?: string;
  downloaded?: boolean;
}

export interface fetchModule {
  (
    page: puppeteer.Page,
    searchWord: string,
    outDir: string,
    mediaDir: string,
    id?: string,
    config?: any
  ): Promise<fetchResult>;
}
