import { Command } from 'commander';

export const fixCommand = new Command('fix')
  .description('Auto-fix issues found by scan (coming soon)')
  .argument('[path]', 'path to fix', '.')
  .action(async () => {
    console.log('hauntr fix — coming soon');
  });
