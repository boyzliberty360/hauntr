import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

const DEFAULTS = {
  rules: {
    unusedImports: 'warn',
    largeComponents: 'warn',
    readmeCheck: 'warn',
  },
  ignore: [],
};

export async function loadConfig(rootPath, cliOptions = {}) {
  const configPath = resolve(join(rootPath, 'hauntr.config.js'));
  let fileConfig = {};

  if (existsSync(configPath)) {
    const mod = await import(pathToFileURL(configPath).href);
    fileConfig = mod.default ?? {};
  }

  const merged = {
    ...DEFAULTS,
    ...fileConfig,
    rules: {
      ...DEFAULTS.rules,
      ...(fileConfig.rules ?? {}),
    },
    ignore: [
      ...DEFAULTS.ignore,
      ...(fileConfig.ignore ?? []),
      ...(cliOptions.ignore ?? []),
    ],
  };

  if (cliOptions.rules) {
    for (const rule of cliOptions.rules) {
      merged.rules[rule] = merged.rules[rule] ?? 'warn';
    }
  }

  return merged;
}