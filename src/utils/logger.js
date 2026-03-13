import chalk from 'chalk';

export const logger = {
  info: (msg) => console.log(chalk.cyan('  info'), msg),
  warn: (msg) => console.log(chalk.yellow('  warn'), msg),
  error: (msg) => console.log(chalk.red(' error'), msg),
  success: (msg) => console.log(chalk.green('    ok'), msg),
  dim: (msg) => console.log(chalk.dim(`       ${msg}`)),
};
