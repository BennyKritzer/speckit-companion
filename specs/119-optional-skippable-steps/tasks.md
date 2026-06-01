# Tasks: Optional Skippable Steps

## Execution Plan
**Feature**: Optional Skippable Steps
**Total Tasks**: 12
**Suggested MVP**: Complete Phase 2 (Foundational schemas) and Phase 3 (US1 - Footer actions) first.

## Dependency Graph
Phase 1 (Setup) -> Phase 2 (Foundational) -> Phase 3 (US1) -> Phase 4 (US2) -> Phase 5 (Polish)

## Parallel Execution Examples
- In Phase 3: Extension-side `messageHandlers.ts` can be built in parallel with `FooterActions.tsx` given the pre-agreed contract in Phase 2.
- In Phase 4: `stepHistoryDerivation.ts` logic can be implemented independently from the React UI (`StepTab.tsx` and `PhasesCard.tsx`).

---

## Phase 1: Setup
*Goal: Initialize the implementation workspace and structure.*

- [X] T001 Verify standard test runner is functional in `tests/unit/spec-viewer/footerActions.spec.ts`

## Phase 2: Foundational 
*Goal: Extend core type definitions shared between Extension and Webview.*
*Independent test: Compile should pass without errors after updating types.*

- [X] T002 Update `SpecContext` schemas in `src/core/types/specContext.ts` to include `skip` in action `kind`
- [X] T003 Update webview data contracts in `webview/src/spec-viewer/types.ts` (`StepHistoryEntry.skippedAt`, `WorkflowStepConfig.optional`)

## Phase 3: Skip Optional Steps via Footer
*Goal: System displays and processes skip actions.*
*Independent test: Clicking "Skip" saves a "skip" action to `.spec-context.json`.*

- [X] T004 [P] [US1] Define `optional: true` for Clarify, Analyze, Checklist, Git Validate in `src/features/workflows/workflowManager.ts`
- [X] T005 [P] [US1] Add `skipStep` command handler extending the API in `src/features/spec-viewer/messageHandlers.ts` (must explicitly advance `currentStep`)
- [X] T006 [P] [US1] Expose the `SKIP` footer action for optional active steps in `src/features/spec-viewer/footerActions.ts`
- [X] T007 [P] [US1] Render the Skip action button conditionally in `webview/src/spec-viewer/components/FooterActions.tsx`
- [X] T007b [US1] Implement 'unskip' / revert skip functionality (UI button + command handler) for steps where the next step has not started

## Phase 4: Skipped Status Reflected in Navbar
*Goal: Visual integration of skipped status and calculation adjustments.*
*Independent test: The math drops dropped steps and UI greys them out.*

- [X] T008 [P] [US2] Update history math, calculate `skippedAt`, and exclude skipped steps from completion totals in `src/features/specs/stepHistoryDerivation.ts`
- [X] T009 [P] [US2] Render visual strikethrough/disabled styling for skipped steps in `webview/src/spec-viewer/components/StepTab.tsx`
- [X] T010 [P] [US2] Display "Skipped" and zero active duration in `webview/src/spec-viewer/components/cards/PhasesCard.tsx`

## Phase 5: Polish
*Goal: Ensure legacy support and regression verification.*

- [X] T011 Run all Jest tests and resolve any broken state derivations in `tests/unit/spec-viewer/stateDerivation.test.ts`
