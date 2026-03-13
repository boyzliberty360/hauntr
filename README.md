<div align="center">

# 👻 Hauntr

### Your AI codebase engineer

[![npm version](https://img.shields.io/npm/v/hauntr?color=black&style=flat-square)](https://npmjs.com/package/hauntr)
[![npm downloads](https://img.shields.io/npm/dm/hauntr?color=black&style=flat-square)](https://npmjs.com/package/hauntr)
[![CI](https://github.com/boyzliberty360/hauntr/actions/workflows/ci.yml/badge.svg)](https://github.com/boyzliberty360/hauntr/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-black?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-black?style=flat-square)](package.json)

**Hauntr scans your codebase, finds issues, and uses AI to explain exactly why they're a problem — with a ready-to-paste fix.**

[Installation](#installation) · [Usage](#usage) · [AI Mode](#ai-mode) · [Configuration](#configuration) · [Rules](#built-in-rules) · [Custom Rules](#writing-custom-rules)

</div>

---

<!-- Record your GIF with: https://www.cockos.com/licecap/ or https://asciinema.org -->
<!-- Drop the GIF here -->

## Why Hauntr?

Most linters tell you *what* is wrong. Hauntr tells you *why* it matters and shows you the fix — powered by AI.

```
hauntr scan --ai
```

```
  src/components/Dashboard.jsx
  ⚠  "useEffect" is imported but never used   unusedImports

       Why: Unused imports increase bundle size and make it harder for other
       developers to understand what a component actually depends on.

       Fix:
         import { useState } from 'react';
```

---

## Installation

```bash
npm install -g hauntr
```

Requires Node.js 18+.

---

## Usage

```bash
# Scan current directory
hauntr scan

# Scan a specific path
hauntr scan ./src

# AI-powered explanations and fixes
hauntr scan --ai

# Save a markdown report
hauntr scan --output markdown

# Output raw JSON
hauntr scan --output json

# Create a config file
hauntr init
```

---

## AI Mode

Hauntr uses AI to enrich every issue it finds with:

- **Why** — a plain-English explanation of the risk
- **Fix** — a minimal corrected code snippet, ready to paste

To use AI mode, set your API key and pass the `--ai` flag:

```bash
# Groq (free)
export GROQ_API_KEY="gsk_..."
hauntr scan --ai

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
hauntr scan --ai
```

Get a free Groq key at [console.groq.com](https://console.groq.com).

---

## Configuration

Create a `hauntr.config.js` in your project root, or run `hauntr init` to scaffold one:

```js
// hauntr.config.js
export default {
  rules: {
    unusedImports: 'warn',
    largeComponents: { severity: 'warn', maxLines: 300 },
    readmeCheck: 'error',
  },
  ignore: ['dist', 'coverage', '*.test.js'],
};
```

### Severity levels

| Value | Behaviour |
|---|---|
| `'error'` | Exits with code 1, fails CI |
| `'warn'` | Reported but does not fail CI |
| `'off'` | Rule disabled |

---

## Built-in Rules

| Rule | What it catches | Fixable |
|---|---|---|
| `unusedImports` | Imported bindings never referenced in the file | Yes |
| `largeComponents` | Component files over a line threshold (default: 300) | No |
| `readmeCheck` | Missing README or missing Installation/Usage sections | No |

Full documentation for each rule: [docs/rules.md](docs/rules.md)

---

## Writing Custom Rules

Every rule is a plain JS object with a `run` method. Register it in your config:

```js
// my-rules/noConsole.js
export const noConsole = {
  meta: {
    name: 'noConsole',
    description: 'Disallows console.log statements in production code.',
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

```js
// hauntr.config.js
import { registry } from 'hauntr/rules';
import { noConsole } from './my-rules/noConsole.js';

registry.register('noConsole', noConsole);

export default {
  rules: {
    noConsole: 'error',
  },
};
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full rule API reference.

---

## CI Integration

Hauntr exits with code `1` when any `error`-level issues are found, making it drop-in ready for GitHub Actions:

```yaml
# .github/workflows/hauntr.yml
name: Hauntr

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g hauntr
      - run: hauntr scan
```

---

## Contributing

Contributions are welcome — especially new rules. See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

```bash
git clone https://github.com/boyzliberty360/hauntr.git
cd hauntr
npm install
npm test
```

---

## License

MIT © [boyzliberty360](https://github.com/boyzliberty360)
