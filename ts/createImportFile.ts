import * as fs from 'fs';

export default function createImportFile(
  content: string,
  outDir?: string,
  basename?: string
) {
  return new Promise<void>((resolve, reject) => {
    const filePath = outDir || 'out';
    basename = basename ? `${basename}_` : '';
    fs.writeFile(
      `${filePath}/${basename}import.txt`,
      content,
      {flag: 'w+'},
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
}
