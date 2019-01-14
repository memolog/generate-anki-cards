export function generateFileName(fileName: string) {
  return fileName
    .replace(/<[^>]+>([^<]*)<\/[^>]+>/, '$1')
    .replace(/\s/g, '_')
    .replace(/[^0-9a-zA-Z_]/g, '')
    .toLocaleLowerCase();
}
