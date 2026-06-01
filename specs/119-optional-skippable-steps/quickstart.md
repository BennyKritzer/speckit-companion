# Quickstart

No new end-user tools required. Extension tests (`jest`) ensure that modifying the Step history math doesn't break legacy files.

## Local Testing
```bash
npm run compile
npm run test:watch
# Specifically target footer actions and derivations
npx jest tests/unit/spec-viewer/footerActions.spec.ts
npx jest tests/unit/spec-viewer/stateDerivation.test.ts
```
