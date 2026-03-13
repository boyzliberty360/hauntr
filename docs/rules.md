# Built-in Rules

- [unusedImports](#unusedimports)
- [largeComponents](#largecomponents)
- [readmeCheck](#readmecheck)

---

## unusedImports

**Flags imported bindings that are never referenced in the file.**

Unused imports bloat your bundle, confuse readers, and are a sign of leftover code. This rule catches named imports, default imports, and namespace imports (`* as foo`) that appear nowhere in the file body.

| Property | Value |
|---|---|
| Severity default | `warn` |
| Fixable | Yes — remove the unused binding |
| Applies to | `.js` `.jsx` `.ts` `.tsx` |

### Config

```js
export default {
  rules: {
    unusedImports: 'warn',        // simple
    unusedImports: 'error',       // strict
    unusedImports: 'off',         // disabled
  },
};
```

### Examples

```js
// bad — useEffect is never used
import { useState, useEffect } from 'react';
const App = () => <div />;

// good
import { useState } from 'react';
const App = () => {
  const [x] = useState(0);
  return <div>{x}</div>;
};
```

---

## largeComponents

**Flags component files that exceed a line count threshold.**

Large components are hard to review, hard to test, and usually doing too many things. This rule encourages splitting components before they become unmanageable.

| Property | Value |
|---|---|
| Severity default | `warn` |
| Fixable | No |
| Applies to | `.jsx` `.tsx` `.vue` `.svelte` |
| Default max lines | `300` |

### Config

```js
export default {
  rules: {
    largeComponents: 'warn',                              // default threshold (300)
    largeComponents: { severity: 'warn', maxLines: 200 }, // custom threshold
    largeComponents: 'error',                             // fail CI on large components
  },
};
```

### Examples

```
⚠  Component is 487 lines (max: 300). Consider splitting it.
   src/components/Dashboard.jsx
```

---

## readmeCheck

**Ensures a README.md exists at the project root and contains required sections.**

A missing or incomplete README is one of the most common reasons developers skip a package. This rule enforces a minimum viable README — an Installation section and a Usage section.

| Property | Value |
|---|---|
| Severity default | `warn` |
| Fixable | No |
| Applies to | Project root (checked once per scan) |

### Config

```js
export default {
  rules: {
    readmeCheck: 'warn',   // warn if README missing or incomplete
    readmeCheck: 'error',  // fail CI
    readmeCheck: 'off',    // disabled
  },
};
```

### What it checks

- `README.md` exists at the project root
- Contains a `## Installation` section
- Contains a `## Usage` section

### Examples

```
⚠  No README.md found at project root.
✕  README is missing a "## installation" section.
✕  README is missing a "## usage" section.
```

---

## Writing your own rule

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full rule API and a step-by-step guide.
