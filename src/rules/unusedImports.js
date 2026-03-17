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

  /**
   * Remove or prune import lines that contain only unused bindings.
   *
   * Strategy:
   *  - Group issues by line number.
   *  - For each affected import line, remove bindings that are unused.
   *  - If every binding on that line is unused, drop the whole line.
   *  - If only some named imports are unused, rewrite the import without them.
   *
   * @param {string} content   Original file content
   * @param {Array}  issues    Issues produced by run() for this file
   * @returns {string}         Fixed file content
   */
  fix(content, issues) {
    const lines = content.replace(/\r\n/g, '\n').split('\n');

    // Collect unused bindings grouped by 1-based line number
    const unusedByLine = new Map();
    for (const issue of issues) {
      if (issue.rule !== 'unusedImports') continue;
      // message format: `"<binding>" is imported but never used`
      const match = issue.message.match(/^"([^"]+)"/);
      if (!match) continue;
      const binding = match[1];
      const lineIdx = issue.line - 1; // convert to 0-based
      if (!unusedByLine.has(lineIdx)) unusedByLine.set(lineIdx, new Set());
      unusedByLine.get(lineIdx).add(binding);
    }

    const namedImportRe = /^(\s*import\s+)\{([^}]+)\}(\s+from\s+['"][^'"]+['"].*)/;

    const fixedLines = lines.map((line, idx) => {
      if (!unusedByLine.has(idx)) return line;

      const unused = unusedByLine.get(idx);

      // Named imports: `import { A, B, C } from '...'`
      const namedMatch = line.match(namedImportRe);
      if (namedMatch) {
        const [, prefix, namedBlock, suffix] = namedMatch;
        const remaining = namedBlock
          .split(',')
          .map((s) => s.trim())
          .filter((s) => {
            if (!s) return false;
            // handle `original as alias` — check the alias
            const alias = s.split(/\s+as\s+/).pop().trim();
            return !unused.has(alias);
          });

        // All named imports removed → drop the line
        if (remaining.length === 0) return null;

        return `${prefix}{ ${remaining.join(', ')} }${suffix}`;
      }

      // Default or namespace import — if binding is unused, drop the whole line
      return null;
    });

    return fixedLines.filter((l) => l !== null).join('\n');
  },
};