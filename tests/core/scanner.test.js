import { scanner } from '../../src/core/scanner.js';

describe('scanner', () => {
  it('returns file objects with path and content', async () => {
    const files = await scanner.scan('./src', {
      patterns: ['**/*.js'],
      ignore: [],
    });

    expect(Array.isArray(files)).toBe(true);
    expect(files.length).toBeGreaterThan(0);
    expect(files[0]).toHaveProperty('path');
    expect(files[0]).toHaveProperty('content');
    expect(typeof files[0].content).toBe('string');
  });

  it('respects ignore patterns', async () => {
    const files = await scanner.scan('.', {
      patterns: ['**/*.js'],
      ignore: ['src/**'],
    });

    const hasSrcFile = files.some((f) => f.path.includes('/src/'));
    expect(hasSrcFile).toBe(false);
  });
});
