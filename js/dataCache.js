"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const touch = require("touch");
class DataCache {
    constructor(outDir) {
        this.outDir = outDir || 'out';
    }
    static getInstance(outDir) {
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
        return new Promise((resolve, reject) => {
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
                    }
                    catch (err) {
                        json = {};
                    }
                    this.data = json;
                    resolve(this.data);
                });
            });
        });
    }
    updateCacheFile() {
        return new Promise((resolve, reject) => {
            const content = JSON.stringify(this.data) || '{}';
            const dataCacheFilePath = this.getFilePath();
            fs.writeFile(dataCacheFilePath, content, { flag: 'w+' }, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
DataCache.filename = 'data_cache.json';
exports.DataCache = DataCache;
