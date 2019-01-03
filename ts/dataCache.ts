import * as fs from 'fs';
import * as path from 'path';
import * as touch from 'touch';

interface dataCache {
  [key: string]: {
    [key: string]: any;
  };
}

export class DataCache {
  static singletone: DataCache;
  static filename = 'data_cache.json';
  outDir: string;
  data: dataCache;
  constructor(outDir?: string) {
    this.outDir = outDir || 'out';
  }
  static getInstance(outDir?: string): DataCache {
    if (DataCache.singletone) {
      return DataCache.singletone;
    }
    DataCache.singletone = new DataCache(outDir);
    return DataCache.singletone;
  }
  getFilePath() {
    return path.resolve(this.outDir, DataCache.filename);
  }
  readData() {
    return new Promise<dataCache>((resolve, reject) => {
      if (this.data) {
        resolve(this.data);
        return;
      }
      const dataCacheFilePath = this.getFilePath();
      touch(dataCacheFilePath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        fs.readFile(dataCacheFilePath, 'utf8', (err, data) => {
          if (err) {
            reject(err);
          }
          let json;
          try {
            json = JSON.parse(data);
          } catch (err) {
            json = <DataCache>{};
          }
          this.data = json;
          resolve(this.data);
        });
      });
    });
  }
  updateCacheFile() {
    return new Promise<void>((resolve, reject) => {
      const content = JSON.stringify(this.data);
      const dataCacheFilePath = this.getFilePath();
      fs.writeFile(dataCacheFilePath, content, {flag: 'w+'}, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}
