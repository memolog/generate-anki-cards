import * as fs from 'fs';

export default function checkIfFileExists(
  name: string,
  ext: string,
  outDir: string,
  mediaDir: string
) {
  return new Promise<boolean>((resolve, reject) => {
    fs.access(`${outDir}/${mediaDir}/${name}${ext}`, (err) => {
      resolve(!err);
    });
  });
}
