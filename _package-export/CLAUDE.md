# Agentation Package

This is the publishable npm package. Changes here affect everyone who installs `agentation`.

## Critical Rules

1. **NEVER run `npm publish`** - Only publish when explicitly instructed
2. **NEVER bump version** in package.json without explicit instruction
3. **NEVER modify exports** in index.ts without discussing breaking changes

## What Gets Published

- `dist/` folder (compiled from `src/`)
- `package.json`, `README.md`, `LICENSE`

## Before Modifying `src/`

- Consider: Is this a breaking change?
- Consider: Does this affect the API surface?
- Consider: Will existing users' code still work?

## Main Export

```tsx
import { Agentation } from 'agentation';
```

CSS-only animations, no external runtime dependencies beyond React.

## Testing Changes

1. Run `pnpm build` to ensure it compiles
2. Check the example app still works: `pnpm dev`
3. Verify no TypeScript errors in consumers

## Before v1 Release

See PLAN.md for detailed roadmap.
