import { registry } from '../rules/index.js';

/**
 * @typedef {Object} AIInsight
 * @property {string} explanation  - why this is a problem
 * @property {string} fix          - suggested code fix
 */

/**
 * @typedef {Object} Issue
 * @property {string} rule
 * @property {'error'|'warn'} severity
 * @property {string} message
 * @property {string} file
 * @property {number} [line]
 * @property {AIInsight} [ai]      - present only when --ai flag used
 */

export const analyzer = {
  /**
   * Run all active rules against scanned files.
   * @param {Array<{path: string, content: string}>} files
   * @param {object} config
   * @returns {Promise<{files: number, issues: Issue[], fileContents: Map<string,string>}>}
   */
  async analyze(files, config = {}) {
    const activeRules = registry.resolve(config.rules);
    const issues = [];

    // Build a content map so the AI layer can look up source by file path
    const fileContents = new Map(files.map((f) => [f.path, f.content]));

    for (const file of files) {
      for (const rule of activeRules) {
        const ruleIssues = await rule.run(file, config);
        issues.push(...ruleIssues);
      }
    }

    return {
      files: files.length,
      issues,
      fileContents,
    };
  },
};
