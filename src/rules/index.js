import { unusedImports } from './unusedImports.js';
import { largeComponents } from './largeComponents.js';
import { readmeCheck } from './readmeCheck.js';

const BUILT_IN_RULES = {
  unusedImports,
  largeComponents,
  readmeCheck,
};

export const registry = {
  _rules: { ...BUILT_IN_RULES },

  /**
   * Register a custom rule.
   * @param {string} name
   * @param {object} rule - must have a run(file, config) method
   */
  register(name, rule) {
    if (typeof rule.run !== 'function') {
      throw new Error(`Rule "${name}" must export a run(file, config) function.`);
    }
    this._rules[name] = rule;
  },

  /**
   * Resolve active rules from config.
   * @param {object} rulesConfig  e.g. { unusedImports: 'warn', largeComponents: 'off' }
   * @returns {Array<{name: string, severity: string, run: Function}>}
   */
  resolve(rulesConfig = {}) {
    return Object.entries(rulesConfig)
      .filter(([, value]) => value !== 'off' && value !== false)
      .map(([name, value]) => {
        const rule = this._rules[name];
        if (!rule) throw new Error(`Unknown rule: "${name}". Is it registered?`);

        const severity = typeof value === 'string' ? value : value?.severity ?? 'warn';
        const options = typeof value === 'object' ? value : {};

        return { name, severity, options, run: rule.run.bind(rule) };
      });
  },

  list() {
    return Object.keys(this._rules);
  },
};
