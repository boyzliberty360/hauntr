import { unusedImports } from '../../src/rules/unusedImports.js';

const issue = (binding, line = 1) => ({
  rule: 'unusedImports',
  severity: 'warn',
  message: `"${binding}" is imported but never used`,
  file: '/project/src/app.js',
  line,
});

describe('unusedImports fix()', () => {
  it('removes an unused default import line entirely', () => {
    const content = "import React from 'react';\nconst x = 1;";
    const result = unusedImports.fix(content, [issue('React')]);
    expect(result).toBe('const x = 1;');
  });

  it('removes an unused namespace import line entirely', () => {
    const content = "import * as utils from './utils';\nconst x = 1;";
    const result = unusedImports.fix(content, [issue('utils')]);
    expect(result).toBe('const x = 1;');
  });

  it('removes only the unused binding from a named import, keeps the rest', () => {
    const content = "import { useState, useEffect } from 'react';\nuseState();";
    const result = unusedImports.fix(content, [issue('useEffect')]);
    expect(result).toBe("import { useState } from 'react';\nuseState();");
  });

  it('removes the entire named import line when all bindings are unused', () => {
    const content = "import { foo, bar } from './utils';\nconst x = 1;";
    const result = unusedImports.fix(content, [issue('foo'), issue('bar')]);
    expect(result).toBe('const x = 1;');
  });

  it('removes the unused aliased binding from a named import', () => {
    const content = "import { foo as myFoo, bar } from './utils';\nbar();";
    const result = unusedImports.fix(content, [issue('myFoo')]);
    expect(result).toBe("import { bar } from './utils';\nbar();");
  });

  it('handles multiple unused imports across different lines', () => {
    const content = [
      "import React from 'react';",
      "import { useState, useEffect } from 'react';",
      'useState();',
    ].join('\n');

    const result = unusedImports.fix(content, [
      issue('React', 1),
      issue('useEffect', 2),
    ]);

    expect(result).toBe("import { useState } from 'react';\nuseState();");
  });

  it('does not modify lines with no unused imports', () => {
    const content = "import { useState } from 'react';\nuseState();";
    const result = unusedImports.fix(content, []);
    expect(result).toBe(content);
  });

  it('does not touch non-import lines', () => {
    const content = "import { foo } from './utils';\nconst bar = 1;\nfoo();";
    const result = unusedImports.fix(content, []);
    expect(result).toBe(content);
  });
});