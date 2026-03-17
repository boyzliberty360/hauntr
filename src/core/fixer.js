import { writeFileSync } from 'fs';

/**
 * Apply auto-fixes to files using each rule's fix() method.
 *
 * @param {object} results        Output from analyzer.analyze()
 * @param {object} ruleRegistry   Map of ruleName → rule object
 * @param {object} options
 * @param {boolean} options.dryRun  If true, compute fixes but don't write files
 * @returns {{ fixed: FixedFile[], unfixable: Issue[], dryRun: boolean }}
 */
export async function applyFixes(results, ruleRegistry, options = {}) {
  const { dryRun = false } = options;

  // Group issues by file path
  const issuesByFile = new Map();
  for (const issue of results.issues) {
    if (!issuesByFile.has(issue.file)) issuesByFile.set(issue.file, []);
    issuesByFile.get(issue.file).push(issue);
  }

  const fixed = [];
  const unfixable = [];

  for (const [filePath, issues] of issuesByFile.entries()) {
    const originalContent = results.fileContents.get(filePath);
    if (originalContent === undefined) continue;

    let content = originalContent;
    let fileWasFixed = false;
    const appliedRules = [];

    // Separate fixable from unfixable issues for this file
    const fixableIssues = issues.filter((issue) => {
      const rule = ruleRegistry[issue.rule];
      return rule?.meta?.fixable && typeof rule.fix === 'function';
    });

    const notFixable = issues.filter((issue) => {
      const rule = ruleRegistry[issue.rule];
      return !(rule?.meta?.fixable && typeof rule.fix === 'function');
    });

    unfixable.push(...notFixable);

    if (fixableIssues.length === 0) continue;

    // Group fixable issues by rule and apply each rule's fix() once per file
    const byRule = new Map();
    for (const issue of fixableIssues) {
      if (!byRule.has(issue.rule)) byRule.set(issue.rule, []);
      byRule.get(issue.rule).push(issue);
    }

    for (const [ruleName, ruleIssues] of byRule.entries()) {
      const rule = ruleRegistry[ruleName];
      try {
        const fixedContent = rule.fix(content, ruleIssues);
        if (fixedContent !== content) {
          content = fixedContent;
          fileWasFixed = true;
          appliedRules.push(ruleName);
        }
      } catch (err) {
        // If a rule's fix() throws, treat those issues as unfixable
        unfixable.push(...ruleIssues);
      }
    }

    if (fileWasFixed) {
      fixed.push({
        path: filePath,
        originalContent,
        fixedContent: content,
        appliedRules,
        issueCount: fixableIssues.length,
      });

      if (!dryRun) {
        writeFileSync(filePath, content, 'utf8');
      }
    }
  }

  return { fixed, unfixable, dryRun };
}

/**
 * Print a human-readable fix summary to stdout.
 */
export function reportFixes({ fixed, unfixable, dryRun }) {
  const totalFixed = fixed.reduce((sum, f) => sum + f.issueCount, 0);
  const fileCount = fixed.length;

  if (dryRun) {
    console.log('\n👻 hauntr fix — dry run\n');
  }

  if (fixed.length === 0 && unfixable.length === 0) {
    console.log('✨ No issues to fix.');
    return;
  }

  if (fixed.length > 0) {
    const verb = dryRun ? 'Would fix' : 'Fixed';
    console.log(
      `\n✔  ${verb} ${totalFixed} issue${totalFixed !== 1 ? 's' : ''} across ${fileCount} file${fileCount !== 1 ? 's' : ''}`
    );

    for (const f of fixed) {
      console.log(`   ${f.path}`);
      if (dryRun) {
        // Show a compact diff: removed lines prefixed with -
        const origLines = f.originalContent.split('\n');
        const fixedLines = f.fixedContent.split('\n');
        const removedLines = origLines.filter((l) => !fixedLines.includes(l));
        for (const l of removedLines) {
          console.log(`     \x1b[31m- ${l}\x1b[0m`);
        }
      }
    }
  }

  if (unfixable.length > 0) {
    console.log(
      `\n⚠  ${unfixable.length} issue${unfixable.length !== 1 ? 's' : ''} could not be auto-fixed — run \`hauntr scan\` to review`
    );
  }

  if (dryRun) {
    console.log('\n  Run without --dry-run to apply these changes.\n');
  } else {
    console.log('');
  }
}