import { statSync, existsSync } from 'fs';

export function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

export function isDirectory(path) {
  return existsSync(path) && statSync(path).isDirectory();
}
