import { Command } from 'commander';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export const initCommand = new Command('init')
  .description('Create a hauntr.config.js in the current directory')
  .action(() => {
    const configPath = join(process.cwd(), 'hauntr.config.js');

    if (existsSync(configPath)) {
      console.log('hauntr.config.js already exists.');
      return;
    }

    const template = `/** @type {import('hauntr').Config} */
export default {
  rules: {
    unusedImports: 'warn',
    largeComponents: { severity: 'warn', maxLines: 300 },
    readmeCheck: 'error',
  },
  ignore: ['node_modules', 'dist', '.git'],
};
`;

    writeFileSync(configPath, template, 'utf8');
    console.log('Created hauntr.config.js');
  });
