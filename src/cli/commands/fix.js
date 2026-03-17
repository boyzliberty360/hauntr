import { Command } from 'commander';
import ora from 'ora';
import { scanner } from '../../core/scanner.js';
import { analyzer } from '../../core/analyzer.js';
import { loadConfig } from '../../core/config.js';
import { applyFixes, reportFixes } from '../../core/fixer.js';
import { registry } from '../../rules/index.js';

export const fixCommand = new Command('fix')
  .description('Auto-fix issues found by scan')
  .argument('[path]', 'path to fix', '.')
  .option('-r, --rules <rules...>', 'rules to run')
  .option('--ignore <patterns...>', 'glob patterns to ignore')
  .option('--dry-run', 'show what would be fixed without writing any files')
  .action(async (scanPath, options) => {
    const spinner = ora('Scanning codebase...').start();

    try {
      const config = await loadConfig(scanPath, options);
      const files = await scanner.scan(scanPath, config);

      spinner.text = `Analyzing ${files.length} files...`;
      const results = await analyzer.analyze(files, config);
      spinner.succeed(`Scanned ${files.length} files`);

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
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });