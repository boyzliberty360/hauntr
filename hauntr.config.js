/** @type {import('hauntr').Config} */
export default {
  rules: {
    unusedImports: 'warn',
    largeComponents: { severity: 'warn', maxLines: 300 },
    readmeCheck: 'error',
  },
  ignore: ['node_modules', 'dist', '.git'],
};
