/**
 * Rule: unusedImports
 * Detects import statements where the imported binding is never referenced
 * in the rest of the file.
 */
export const unusedImports = {
  meta: {
    name: 'unusedImports',
    description: 'Detects imported bindings that are never used in the file.',
    fixable: true,
  },

  run(file, options = {}) {
    const issues = [];

    const content = file.content.replace(/\r\n/g, '\n');
    const lines = content.split('\n');

    const importRe = /^\s*import\s+(?:(?:\*\s+as\s+(\w+))|(\w+)|(?:{([^}]+)}))\s+from\s+['"][^'"]+['"]/;

    const importLineIndices = new Set();
    const allBindings = [];

    lines.forEach((line, idx) => {
      const match = line.match(importRe);
      if (!match) return;

      importLineIndices.add(idx);

      const [, starAlias, defaultImport, namedBlock] = match;

      if (starAlias) {
        allBindings.push({ binding: starAlias, lineIdx: idx });
      } else if (defaultImport) {
        allBindings.push({ binding: defaultImport, lineIdx: idx });
      } else if (namedBlock) {
        namedBlock.split(',').forEach((raw) => {
          const binding = raw.trim().split(/\s+as\s+/).pop().trim();
          if (binding) allBindings.push({ binding, lineIdx: idx });
        });
      }
    });

    const body = lines
      .filter((_, idx) => !importLineIndices.has(idx))
      .join('\n');

    for (const { binding, lineIdx } of allBindings) {
      const usageRe = new RegExp(`\\b${binding}\\b`);
      if (!usageRe.test(body)) {
        issues.push({
          rule: 'unusedImports',
          severity: options.severity ?? 'warn',
          message: `"${binding}" is imported but never used`,
          file: file.path,
          line: lineIdx + 1,
        });
      }
    }

    return issues;
  },
};