import { unusedImports } from '../../src/rules/unusedImports.js';

const file = (content) => ({ path: '/project/src/app.js', content });

describe('unusedImports rule', () => {
  it('flags an import that is never used', () => {
    const result = unusedImports.run(
      file("import { useState } from 'react';\n\nconst App = () => <div />;")
    );

    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('unusedImports');
    expect(result[0].message).toContain('useState');
  });

  it('passes when all imports are used', () => {
    const result = unusedImports.run(
      file("import { useState } from 'react';\nconst [x] = useState(0);")
    );

    expect(result).toHaveLength(0);
  });

  it('uses the severity from options', () => {
    const result = unusedImports.run(
      file("import { useEffect } from 'react';\n"),
      { severity: 'error' }
    );

    expect(result[0].severity).toBe('error');
  });

  it('detects multiple unused bindings in one import', () => {
    const result = unusedImports.run(
      file("import { useRef, useMemo } from 'react';\n")
    );

    expect(result).toHaveLength(2);
  });
});