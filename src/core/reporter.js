import chalk from 'chalk';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SEVERITY_COLOR = {
  error: chalk.red,
  warn: chalk.yellow,
};

const SEVERITY_ICON = {
  error: '✕',
  warn: '⚠',
};

export const reporter = {
  /**
   * Output results in the requested format.
   * @param {{files: number, issues: import('./analyzer.js').Issue[]}} results
   * @param {'text'|'json'|'markdown'} format
   */
  report(results, format = 'text') {
    switch (format) {
      case 'json':
        return this._json(results);
      case 'markdown':
        return this._markdown(results);
      default:
        return this._text(results);
    }
  },

 _text({ issues }) {
    if (issues.length === 0) {
      console.log(chalk.green('\n  No issues found.\n'));
      return;
    }

    const grouped = issues.reduce((acc, i) => {
      (acc[i.file] ??= []).push(i);
     return acc;
    }, {});

    for (const [file, fileIssues] of Object.entries(grouped)) {
      console.log(`\n  ${chalk.underline(file)}`);
      for (const issue of fileIssues) {
        const color = SEVERITY_COLOR[issue.severity] ?? chalk.white;
        const icon = SEVERITY_ICON[issue.severity] ?? '·';
        const line = issue.line ? chalk.dim(`:${issue.line}`) : '';

        console.log(`  ${color(icon)}  ${issue.message}${line}  ${chalk.dim(issue.rule)}`);

        if (issue.ai) {
          if (issue.ai.explanation) {
            console.log(chalk.dim(`\n       Why: `) + chalk.white(issue.ai.explanation));
          }
          if (issue.ai.fix) {
            console.log(chalk.dim(`\n       Fix:`));
            for (const fixLine of issue.ai.fix.split('\n')) {
              console.log(chalk.cyan(`         ${fixLine}`));
            }
          }
          console.log();
        }
      }
    }

    const errors = issues.filter((i) => i.severity === 'error').length;
    const warns = issues.filter((i) => i.severity === 'warn').length;

    console.log(chalk.dim('\n  ─────────────────────────────────'));
    console.log(`  ${chalk.red(`${errors} error${errors !== 1 ? 's' : ''}`)}  ${chalk.yellow(`${warns} warning${warns !== 1 ? 's' : ''}`)}\n`);

    if (errors > 0) process.exitCode = 1;
  },

  _json({ files, issues }) {
    console.log(JSON.stringify({ files, issues }, null, 2));
  },

  _markdown({ files, issues }) {
    const lines = [
      `# Hauntr Report\n`,
      `Scanned **${files}** files — **${issues.length}** issues found.\n`,
    ];

    if (issues.length > 0) {
      for (const issue of issues) {
        lines.push(`---\n`);
        lines.push(`### ${issue.severity === 'error' ? '🔴' : '⚠️'} \`${issue.rule}\``);
        lines.push(`**File:** \`${issue.file}\`${issue.line ? ` — line ${issue.line}` : ''}`);
        lines.push(`**Issue:** ${issue.message}\n`);

        if (issue.ai) {
          if (issue.ai.explanation) {
            lines.push(`**Why this matters:** ${issue.ai.explanation}\n`);
          }
          if (issue.ai.fix) {
            lines.push(`**Suggested fix:**\n\`\`\`\n${issue.ai.fix}\n\`\`\``);
          }
        }
        lines.push('');
      }
    }

    const out = lines.join('\n');
    mkdirSync('.hauntr', { recursive: true });
    const dest = join('.hauntr', 'report.md');
    writeFileSync(dest, out, 'utf8');
    console.log(chalk.green(`  Report saved → ${dest}`));
  },
};
