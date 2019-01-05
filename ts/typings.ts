import * as puppeteer from 'puppeteer'; // eslint-disable-line

export interface fetchResult {
  thumbUrl?: string;
  soundUrl?: string;
  soundIPA?: string;
  copyright?: string;
  downloaded?: boolean;
}

export interface fetchOptions {
  page: puppeteer.Page;
  searchWord: string;
  outDir: string;
  mediaDir: string;
  id?: string;
  name?: string;
  ext?: string;
}

export interface fetchModule {
  (options: fetchOptions): Promise<fetchResult>;
}
