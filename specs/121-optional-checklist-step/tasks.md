---
description: "Tasks for implementing Feature 121: Optional steps and ACP race condition fix"
---

# Tasks: Optional Clarify, Checklist, and Analyze Steps & ACP Race Condition Resolution

**Input**: Design documents from `/specs/121-optional-checklist-step/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/webview-contracts.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify baseline spec files are aligned [Setup]
- [x] T002 Configure `.github/copilot-instructions.md` to reference the 121 execution plan [Setup]

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core ACP provider robust step tracking framework & structural types required to prevent the race condition skipping plan.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Extend `AIOptions` interface in `src/ai-providers/aiProvider.ts` to support `step?: string` [Foundational]
- [x] T004 Capture step name on spawn in `src/ai-providers/acpProvider.ts` [Foundational]
- [x] T005 [P] Update `onCompletion` inside `src/ai-providers/acpProvider.ts` to finalize the captured step name rather than dynamically querying current on-disk state [Foundational]
- [x] T006 Update `executeWorkflowStep` in `src/features/specs/specCommands.ts` to populate the `step` option in `aiOptions` [Foundational]
- [x] T007 Update `executeStepInTerminal` in `src/features/spec-viewer/messageHandlers.ts` to populate the `step` option in `aiOptions` [Foundational]

**Checkpoint**: Foundational race condition resolution ready. Steps can now be executed asynchronously without risk of clobbering subsequent steps' context logs.

---

## Phase 3: User Story 1 - Run speckit workflow with optional steps in correct positions (Priority: P1) 🎯 MVP

**Goal**: Update the step registration arrays and order in the backend so optional steps are injected after their respective phases. Remove the actionOnly mask from Checklist so it gets its own Core Tab.

**Independent Test**: Can be verified by running `speckit.specify` then confirming the viewer shows a clarify button; running `speckit.plan` then confirming a checklist button appears; running `speckit.tasks` then confirming an analyze button appears.

### Implementation for User Story 1

- [x] T008 Update canonical `STEP_NAMES` sequence in `src/core/types/specContext.ts` [US1]
- [x] T009 [P] Reorder `DEFAULT_WORKFLOW` steps in `src/features/workflows/workflowManager.ts` to place `checklist` after `plan` (remove `actionOnly` but keep other values), and insert optional `clarify` and `analyze` steps [US1]
- [x] T010 Align `isLifecycleStep` checking list inside `src/features/spec-viewer/messageHandlers.ts` with the new optional steps [US1]
- [x] T011 Align `LIFECYCLE_STEPS` set inside `src/features/specs/specCommands.ts` with the new optional steps [US1]

**Checkpoint**: At this point, the backend and commands workflow configuration contains the accurate step sequence layout, and optional checklist has a document mapping.

---

## Phase 4: User Story 2 - View updated workflow step order (Priority: P1)

**Goal**: Propagate `optional` indicators from default steps to the webview and visually render dedicated themed badges.

**Independent Test**: Open any speckit spec in the viewer and confirm the step tabs show the correct order with clarify, checklist, analyze, and that each displays with an optional badge.

### Implementation for User Story 2

- [x] T012 Include `optional` boolean parameter inside `SpecDocument` interface in `src/features/spec-viewer/types.ts` [US2]
- [x] T013 [P] Include `optional` boolean parameter inside `SpecDocument` interface in `webview/src/spec-viewer/types.ts` [US2]
- [x] T014 Populate `optional: step.optional` attribute for steps inside `src/features/spec-viewer/documentScanner.ts` [US2]
- [x] T015 Render `optional-badge` label visual element on matching tabs inside `webview/src/spec-viewer/components/StepTab.tsx` [US2]
- [x] T016 Add `optional-badge` CSS stylesheet rule matching theme variables in `webview/styles/spec-viewer/_navigation.css` [US2]
- [x] T016a Implement markdown checkbox state parsing and saving in `src/features/spec-viewer/messageHandlers.ts` to serialize interactive webview changes back to on-disk Checklist checklist markdown files [US2, Q1-B]
- [x] T016b Add `.step-tab.skipped` CSS rules in `webview/styles/spec-viewer/_navigation.css` to visually style skipped steps with appropriate strikethrough or distinct muted colors [US2, Q3-A]

**Checkpoint**: User Story 2 is functional. Optional steps are labeled with clean visual indicators inside the Spec Viewer's navigation.

---

## Phase 5: User Story 3 - Skip all optional steps and run the workflow (Priority: P2)

**Goal**: Verify skip/retroactive generation pathways operate correctly under the new workflow steps layout.

**Independent Test**: Skip all optional steps and confirm that the workflow advances successfully, and that optional steps can still be run retroactively.

### Implementation for User Story 3

- [x] T017 Verify that clicking approved "Skip/Next" buttons successfully advances beyond optional steps without execution [US3]
- [x] T018 Confirm that optional tabs/buttons still remain active for retroactive generation after being skipped [US3]

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Test suites alignment and validation verification.

- [x] T019 Update failing unit tests in `src/core/utils/__tests__/shellDetection.test.ts` to match shell quoting format [Polish]
- [x] T020 Update failing unit tests in `src/ai-providers/__tests__/promptCommand.test.ts` to match shell quoting format [Polish]
- [x] T021 Update failing unit tests in `tests/unit/spec-viewer/footerActions.spec.ts` targeting implement steps, and align `src/features/spec-viewer/__tests__/documentScanner.test.ts` to match new `SpecDocument` interfaces [Polish]
- [x] T022 [P] Run `npm run compile` and clean up any remaining TypeScript compiler errors [Polish]
- [x] T023 Run `npm test` and verify that the entire test suite compiles and runs successfully across the workspace [Polish]
- [x] T024 Perform manual verification inside Extension Development Host matching quickstart.md validation steps [Polish]

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories to prevent race conditions during testing.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
- **Polish (Final Phase)**: Depends on all implementation tasks being complete.

---

## Parallel Example: User Story 2

```bash
# We can declare type variables concurrently:
Task: "Include optional parameter inside SpecDocument interface in src/features/spec-viewer/types.ts"
Task: "Include optional parameter inside SpecDocument interface in webview/src/spec-viewer/types.ts"
```

---

## Implementation Strategy

### MVP First (Race Condition & Order Realignment)

1. Solve target step-tracking race conditions (Phase 2).
2. Update steps order list and registry settings (Phase 3).
3. Verify that we can run `specify` -> `clarify` -> `plan` smoothly.

### Incremental Delivery

1. Setup & Foundational race condition fix (MVP!)
2. Move optional steps in `DEFAULT_WORKFLOW` steps array
3. Propagate `optional` indicators to Webview
4. Render themed optional badge text
5. Align test suites and compile
