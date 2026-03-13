# Changelog

All notable changes to Hauntr will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2024-03-13

### Added
- `hauntr scan` — scan a directory for code issues
- `hauntr scan --ai` — enrich issues with AI explanations and code fixes (powered by Groq/Anthropic)
- `hauntr init` — scaffold a `hauntr.config.js` in the current directory
- Built-in rule: `unusedImports` — detects imported bindings never used in the file
- Built-in rule: `largeComponents` — flags component files over a configurable line threshold
- Built-in rule: `readmeCheck` — ensures a README exists with Installation and Usage sections
- Output formats: `text` (default), `json`, `markdown`
- Pluggable rule registry — register custom rules from `hauntr.config.js`
- CI-ready exit codes — exits with code 1 on any `error`-severity issues
- GitHub Actions workflow for test + publish on tag
