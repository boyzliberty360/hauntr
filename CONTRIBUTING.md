# Contributing to Hauntr

First off — thank you. Hauntr gets better with every rule that gets added.

## Table of contents

- [Getting started](#getting-started)
- [Writing a rule](#writing-a-rule)
- [Rule API reference](#rule-api-reference)
- [Testing your rule](#testing-your-rule)
- [Submitting a PR](#submitting-a-pr)
- [Code style](#code-style)

---

## Getting started

```bash
git clone https://github.com/boyzliberty360/hauntr.git
cd hauntr
npm install
npm test
```

All tests should pass before you start making changes.

---

## Writing a rule

A rule is a plain ES module that exports an object with a `meta` property and a `run` method.

### Minimal example

```js
// src/rules/noConsole.js
export const noConsole = {
  meta: {
    name: 'noConsole',
    description: 'Disallows console.log statements.',
    fixable: false,
  },

  run(file, options = {}) {
    const issues = [];
    const lines = file.content.split('\n');

    lines.forEach((line, idx) => {
      if (/console\.(log|warn|error)/.test(line)) {
        issues.push({
          rule: 'noConsole',
          severity: options.severity ?? 'warn',
          message: 'Unexpected console statement',
          file: file.path,
          line: idx + 1,
        });
      }
    });

    return issues;
  },
};
```

### Register it

Add your rule to `src/rules/index.js`:

```js
import { noConsole } from './noConsole.js';

const BUILT_IN_RULES = {
  unusedImports,
  largeComponents,
  readmeCheck,
  noConsole, // add here
};
```

---

## Rule API reference

### `file` object

| Property | Type | Description |
|---|---|---|
| `file.path` | `string` | Absolute path to the file |
| `file.content` | `string` | Full file contents as a UTF-8 string |

### `options` object

| Property | Type | Description |
|---|---|---|
| `options.severity` | `'warn' \| 'error'` | Severity set by the user in config |

Always default to `options.severity ?? 'warn'` so the user can override it.

### Issue object (return value)

| Property | Type | Required | Description |
|---|---|---|---|
| `rule` | `string` | Yes | Rule name |
| `severity` | `'warn' \| 'error'` | Yes | Issue severity |
| `message` | `string` | Yes | Human-readable description |
| `file` | `string` | Yes | Absolute file path |
| `line` | `number` | No | Line number where the issue was found |

Return an empty array `[]` if no issues are found.

### `meta` object

| Property | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Unique rule identifier |
| `description` | `string` | Yes | One-line description shown in docs |
| `fixable` | `boolean` | Yes | Whether the rule can be auto-fixed |

---

## Testing your rule

Create a test file in `tests/rules/` mirroring the rule name:

```js
// tests/rules/noConsole.test.js
import { noConsole } from '../../src/rules/noConsole.js';

const file = (content) => ({ path: '/project/src/app.js', content });

describe('noConsole rule', () => {
  it('flags console.log', () => {
    const result = noConsole.run(file("console.log('hi');"));
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('noConsole');
  });

  it('passes clean files', () => {
    const result = noConsole.run(file("const x = 1;"));
    expect(result).toHaveLength(0);
  });

  it('respects severity option', () => {
    const result = noConsole.run(file("console.log('x');"), { severity: 'error' });
    expect(result[0].severity).toBe('error');
  });
});
```

Run tests:

```bash
npm test
npm run test:watch
```

---

## Submitting a PR

1. Fork the repo
2. Create a branch: `git checkout -b feat/no-console-rule`
3. Add your rule + tests + entry in `src/rules/index.js`
4. Add a row to the rules table in `docs/rules.md`
5. Run `npm test` — all tests must pass
6. Open a PR with a short description of what the rule catches and why it matters

---

## Code style

- ES modules only (`import`/`export`)
- No semicolons debates — just follow what's already there
- Prefer `const` over `let` where possible
- Keep rule files focused — one rule per file
- All rule `run` methods must be synchronous where possible
