import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as https from 'https';

export default function download(
  url: string,
  name: string,
  ext: string,
  outDir: string,
  mediaDir: string
) {
  return new Promise<void>((resolve, reject) => {
    const dir = `${outDir}/${mediaDir}`;
    ext = ext.toLocaleLowerCase();
    mkdirp(dir, (err) => {
      if (err) {
        reject(err);
        return;
      }
      const file = fs.createWriteStream(`${dir}/${name}${ext}`);

      console.log(`download: ${url}`);
      https
        .get(url, (res) => {
          res.on('data', (d) => {
            file.write(d);
          });

          res.on('end', () => {
            resolve();
          });
        })
        .on('error', (e) => {
          console.error(e);
        });
    });
  });
}
