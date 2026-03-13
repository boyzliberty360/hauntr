import { glob } from 'glob';
import { readFileSync } from 'fs';

const DEFAULT_PATTERNS = ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'];

const DEFAULT_IGNORE = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '.git/**',
  'coverage/**',
];

export const scanner = {
  /**
   * Scan a directory and return file objects ready for analysis.
   * @param {string} rootPath
   * @param {object} config
   * @returns {Promise<Array<{path: string, content: string}>>}
   */
  async scan(rootPath, config = {}) {
    const patterns = config.patterns ?? DEFAULT_PATTERNS;
    const ignore = [...DEFAULT_IGNORE, ...(config.ignore ?? [])];

    const paths = await glob(patterns, {
      cwd: rootPath,
      ignore,
      absolute: true,
    });

    return paths.map((filePath) => ({
      path: filePath,
      content: readFileSync(filePath, 'utf8'),
    }));
  },
};
