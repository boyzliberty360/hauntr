import { Command } from 'commander';
import ora from 'ora';
import { scanner } from '../../core/scanner.js';
import { analyzer } from '../../core/analyzer.js';
import { reporter } from '../../core/reporter.js';
import { loadConfig } from '../../core/config.js';
import { enrichAll } from '../../core/ai.js';
import { applyFixes, reportFixes } from '../../core/fixer.js';
import { registry } from '../../rules/index.js';

export const scanCommand = new Command('scan')
  .description('Scan your codebase for issues')
  .argument('[path]', 'path to scan', '.')
  .option('-r, --rules <rules...>', 'rules to run')
  .option('-o, --output <format>', 'output format: text | json | markdown', 'text')
  .option('--ignore <patterns...>', 'glob patterns to ignore')
  .option('--ai', 'enrich issues with AI explanations and code fixes (requires ANTHROPIC_API_KEY or GROQ_API_KEY)')
  .option('--fix', 'auto-fix fixable issues after scanning')
  .option('--dry-run', 'preview fixes without writing files (use with --fix)')
  .action(async (scanPath, options) => {
    const spinner = ora('Scanning codebase...').start();

    try {
      const config = await loadConfig(scanPath, options);
      const files = await scanner.scan(scanPath, config);

      spinner.text = `Analyzing ${files.length} files...`;
      const results = await analyzer.analyze(files, config);
      spinner.succeed(`Scanned ${files.length} files`);

      if (options.ai && results.issues.length > 0) {
        const total = results.issues.length;
        const aiSpinner = ora(
          `Asking Claude about ${total} issue${total !== 1 ? 's' : ''}...`
        ).start();

        results.issues = await enrichAll(
          results.issues,
          results.fileContents,
          (done, total) => {
            aiSpinner.text = `Claude is reviewing issues... (${done}/${total})`;
          }
        );

        aiSpinner.succeed('AI analysis complete');
      }

      // Report issues first so the user sees what was found
      reporter.report(results, options.output);

      // Then apply fixes if requested
      if (options.fix && results.issues.length > 0) {
        const fixableCount = results.issues.filter((issue) => {
          const rule = registry._rules[issue.rule];
          return rule?.meta?.fixable && typeof rule.fix === 'function';
        }).length;

        if (fixableCount === 0) {
          console.log('\n✨ No auto-fixable issues found.');
          return;
        }

        const fixSpinner = ora(
          options.dryRun
            ? `Calculating fixes for ${fixableCount} issue${fixableCount !== 1 ? 's' : ''}...`
            : `Fixing ${fixableCount} issue${fixableCount !== 1 ? 's' : ''}...`
        ).start();

        const fixResult = await applyFixes(results, registry._rules, {
          dryRun: options.dryRun ?? false,
        });

        fixSpinner.succeed(options.dryRun ? 'Dry run complete' : 'Fixes applied');
        reportFixes(fixResult);
      }
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });