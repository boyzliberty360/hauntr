/**
 * Rule: largeComponents
 * Flags React/Vue/Svelte component files that exceed a line threshold.
 * Large components are hard to review and usually need splitting.
 */
export const largeComponents = {
  meta: {
    name: 'largeComponents',
    description: 'Flags component files exceeding a line count threshold.',
    fixable: false,
  },

  /**
   * @param {{path: string, content: string}} file
   * @param {{severity?: string, maxLines?: number}} options
   * @returns {Array<import('../core/analyzer.js').Issue>}
   */
  run(file, options = {}) {
    const isComponent = /\.(jsx|tsx|vue|svelte)$/.test(file.path);
    if (!isComponent) return [];

    const maxLines = options.maxLines ?? 300;
    const lineCount = file.content.split('\n').length;

    if (lineCount <= maxLines) return [];

    return [
      {
        rule: 'largeComponents',
        severity: options.severity ?? 'warn',
        message: `Component is ${lineCount} lines (max: ${maxLines}). Consider splitting it.`,
        file: file.path,
      },
    ];
  },
};
