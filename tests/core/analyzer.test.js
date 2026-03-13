import { analyzer } from '../../src/core/analyzer.js';

const mockFile = (content, ext = '.js') => ({
  path: `/project/src/component${ext}`,
  content,
});

describe('analyzer', () => {
  it('returns results with files count and issues array', async () => {
    const files = [mockFile("import { foo } from './bar.js';\n")];
    const config = { rules: { unusedImports: 'warn' } };

    const result = await analyzer.analyze(files, config);

    expect(result).toHaveProperty('files', 1);
    expect(Array.isArray(result.issues)).toBe(true);
  });

  it('returns no issues for clean files', async () => {
    const files = [mockFile("import { foo } from './bar.js';\nconsole.log(foo);\n")];
    const config = { rules: { unusedImports: 'warn' } };

    const result = await analyzer.analyze(files, config);
    expect(result.issues).toHaveLength(0);
  });

  it('throws on unknown rules', async () => {
    const files = [mockFile('const x = 1;')];
    const config = { rules: { nonExistentRule: 'warn' } };

    await expect(analyzer.analyze(files, config)).rejects.toThrow('Unknown rule');
  });
});
