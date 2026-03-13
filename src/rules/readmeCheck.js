import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';

const README_NAMES = ['README.md', 'readme.md', 'README.MD'];

const REQUIRED_SECTIONS = ['## installation', '## usage'];

/**
 * Rule: readmeCheck
 * Checks that a README exists at the project root and contains
 * essential sections (Installation, Usage).
 */
export const readmeCheck = {
  meta: {
    name: 'readmeCheck',
    description: 'Ensures a README exists with required sections.',
    fixable: false,
  },

  _checkedRoots: new Set(),

  /**
   * @param {{path: string, content: string}} file
   * @param {{severity?: string}} options
   * @returns {Array<import('../core/analyzer.js').Issue>}
   */
  run(file, options = {}) {
    const root = this._findRoot(file.path);
    if (!root || this._checkedRoots.has(root)) return [];
    this._checkedRoots.add(root);

    const readmePath = README_NAMES.map((n) => join(root, n)).find(existsSync);

    if (!readmePath) {
      return [{
        rule: 'readmeCheck',
        severity: options.severity ?? 'warn',
        message: 'No README.md found at project root.',
        file: join(root, 'README.md'),
      }];
    }

    const content = readFileSync(readmePath, 'utf8').toLowerCase();
    const missing = REQUIRED_SECTIONS.filter((s) => !content.includes(s));

    return missing.map((section) => ({
      rule: 'readmeCheck',
      severity: options.severity ?? 'warn',
      message: `README is missing a "${section}" section.`,
      file: readmePath,
    }));
  },

  _findRoot(filePath) {
    let dir = dirname(filePath);
    while (dir !== dirname(dir)) {
      if (existsSync(join(dir, 'package.json'))) return dir;
      dir = dirname(dir);
    }
    return null;
  },
};
