## Summary

<!-- Briefly describe the purpose and scope of this PR. -->

Closes #ISSUE_NUMBER

---

## Type of Change

<!-- In commit messages, breaking changes use the `!` suffix: feat!:, fix!: -->

- [ ] `feat` — New feature (non-breaking)
- [ ] `fix` — Bug fix (non-breaking)
- [ ] `security` — Security fix or hardening
- [ ] `perf` — Performance improvement
- [ ] `refactor` — Code refactor (no behavior change)
- [ ] `test` — Test additions or corrections
- [ ] `docs` — Documentation only
- [ ] `chore` — Build, deps, CI, or tooling
- [ ] `feat!` / `fix!` — **Breaking change** (existing API behavior is altered)

<!-- If this is a breaking change, describe the impact and migration path below. -->

---

## Changes Made

<!-- Describe what changed at a technical level. Be specific — file paths, function names, algorithm steps. -->

-

---

## Algorithm & Security Impact

<!--
  REQUIRED when touching src/crypto/, src/password/, or src/analysis/.
  Check N/A only if none of those paths were modified.
-->

- [ ] **N/A** — This PR does not modify `src/crypto/`, `src/password/`, or `src/analysis/`

- [ ] Deterministic behavior preserved — same inputs produce identical outputs across all platforms
- [ ] Algorithm stability verified locally: `npm run verify:algorithm`
- [ ] No security defaults weakened (hash iterations, salt generation, character diversity thresholds)
- [ ] Timing-attack and side-channel implications considered
- [ ] Cryptographic changes documented with clear rationale

---

## Test Plan

<!-- How did you verify this change works as expected? -->

- [ ] New tests written to cover the change
- [ ] Existing tests updated where behavior changed
- [ ] Tests run against compiled output (`dist/`) — not source files
- [ ] Both TypeScript API and vanilla JS compatibility tested
- [ ] Edge cases and error paths covered
- [ ] Test coverage remains high (target: 100%): `npm run test:coverage`

```bash
# Commands run to verify
npm run type-check
npm test
npm run build
```

```
# Manual test steps (if applicable)

```

---

## Build & TypeScript

- [ ] Full build succeeds: `npm run build` — ESM, CJS, and UMD outputs verified
- [ ] No new `any` types introduced without justification
- [ ] New public interfaces/types exported from the appropriate module
- [ ] Dual API compatibility maintained (TypeScript + vanilla JS consumers)
- [ ] JSDoc annotations added for all new public APIs

---

## Checklist

- [ ] Code follows existing project conventions (strict TypeScript, async/await, immutable patterns)
- [ ] `npm run format` was run on modified files
- [ ] No secrets, API keys, or passwords were committed
- [ ] `CHANGELOG.md` updated following the existing format
- [ ] Relevant docs under `docs/` updated (if public API or behavior changed)
- [ ] Team notified of any breaking changes

---

## Notes for Reviewers

<!-- Highlight tricky logic, deliberate trade-offs, areas of uncertainty, or context not obvious from the diff. -->
