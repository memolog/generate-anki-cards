export function generateFileName(fileName: string) {
  return fileName
    .replace(/<[^>]+>/g, '')
    .replace(/\s/g, '_')
    .replace(/[^0-9a-zA-Z_]/g, '')
    .toLocaleLowerCase();
}
