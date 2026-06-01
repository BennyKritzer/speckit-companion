# Tasks: Jotai Webview State Management

**Input**: Design documents from `/specs/120-jotai-webview-state/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No automated test tasks generated. The feature relies on manual webview verification from `quickstart.md` plus `npm run compile` smoke checks.

**Organization**: Tasks are grouped by user story so each slice can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks on different files
- **[Story]**: User story label (US1, US2, US3)
- Include exact file paths in task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install the new state library used by the spec-viewer webview.

- [X] T001 Add the Jotai dependency to `package.json` and `package-lock.json` for the webview runtime

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the base atom module that every user story will build on.

- [X] T002 Create `webview/src/spec-viewer/store/atoms.ts` with the base Jotai atoms for active spec context, spec content, navigation state, UI state, and the shared viewer snapshot shape

**Checkpoint**: The webview now has a shared atom module ready for the spec-viewer subtree to consume.

---

## Phase 3: User Story 1 - Shared viewer state stays consistent (Priority: P1) 🎯 MVP

**Goal**: Replace the current scattered shared state in the spec-viewer shell with one atom-backed model so the main viewer regions always agree.

**Independent Test**: Open a spec, advance or refresh the workflow, and confirm the navigation, header, footer, activity panel, and elapsed-time display all reflect the same state without manual prop plumbing or a full refresh.

### Implementation for User Story 1

- [X] T003 Wrap the spec-viewer root in Jotai by updating `webview/src/spec-viewer/index.tsx` and `webview/src/spec-viewer/App.tsx` to provide the store and seed the initial atoms from the first viewer snapshot
- [X] T004 [P] [US1] Refactor `webview/src/spec-viewer/components/NavigationBar.tsx`, `webview/src/spec-viewer/components/SpecHeader.tsx`, and `webview/src/spec-viewer/components/StaleBanner.tsx` to subscribe to the shared atoms
- [X] T005 [P] [US1] Refactor `webview/src/spec-viewer/components/FooterActions.tsx` and `webview/src/spec-viewer/components/ElapsedTimer.tsx` to read the same atom-backed viewer state so the footer and timer stay aligned with the rest of the shell
- [X] T006 [P] [US1] Refactor `webview/src/spec-viewer/components/ActivityPanel.tsx`, `webview/src/spec-viewer/components/StepTab.tsx`, and `webview/src/spec-viewer/editor/restoreComments.ts` to consume atom-backed shared state or derived selectors instead of the old signal reads
- [X] T007 [P] [US1] Refactor `webview/src/spec-viewer/App.tsx` to read spec content, activity visibility, and spec-context presence from atoms instead of the old shared signal layer and local state

**Checkpoint**: The core viewer surfaces render from one shared state model and no longer depend on scattered shared-viewer signals.

---

## Phase 4: User Story 2 - Extension-driven updates propagate through one bridge (Priority: P2)

**Goal**: Ensure the extension remains the authority and the webview hydrates the shared store from the incoming snapshot boundary.

**Independent Test**: Trigger a content or workflow update from the extension side and confirm the webview updates from the incoming snapshot without reloading the panel.

### Implementation for User Story 2

- [X] T008 [P] [US2] Audit `src/features/spec-viewer/messageHandlers.ts` and `src/features/spec-viewer/specViewerProvider.ts` to keep the extension-side snapshot payload complete for the webview bridge after the atom migration, especially for ready, refresh, and content-update flows
- [X] T009 [US2] Rewrite the message handler in `webview/src/spec-viewer/index.tsx` so `contentUpdated`, `navStateUpdated`, `viewerStateUpdated`, and the initial `__INITIAL_NAV_STATE__` payload hydrate the Jotai store in one place instead of writing shared viewer data directly into signals

**Checkpoint**: Extension messages flow through one bridge and hydrate the shared webview store consistently.

---

## Phase 5: User Story 3 - Derived viewer state remains trustworthy (Priority: P3)

**Goal**: Move the remaining computed viewer outputs onto derived atoms and retire the old shared-viewer signal layer.

**Independent Test**: Advance through several workflow states and confirm badges, footer visibility, navigation highlights, and elapsed/timing cues stay consistent across rerenders and reloads.

### Implementation for User Story 3

- [X] T010 [P] [US3] Add derived atoms in `webview/src/spec-viewer/store/atoms.ts` for footer visibility, badge/status state, navigation highlights, and elapsed/timing state so each computed viewer output is defined once
- [X] T011 [P] [US3] Add a Storybook helper in `webview/src/spec-viewer/store/storyAtoms.ts` so spec-viewer stories can seed the Jotai store without reaching into `signals.ts` directly
- [X] T012 [US3] Update `webview/src/spec-viewer/components/FooterActions.stories.tsx`, `webview/src/spec-viewer/components/NavigationBar.stories.tsx`, `webview/src/spec-viewer/components/SpecHeader.stories.tsx`, `webview/src/spec-viewer/components/StaleBanner.stories.tsx`, `webview/src/spec-viewer/components/ActivityPanel.stories.tsx`, and `webview/src/spec-viewer/components/__stories__/ViewerTransitions.stories.tsx` to use the story helper and reflect the atom-backed state flow
- [X] T013 [US3] Remove or retire the shared-viewer exports in `webview/src/spec-viewer/signals.ts` once all spec-viewer consumers and stories have moved to atoms

**Checkpoint**: The derived viewer outputs are atom-driven and the old shared-viewer signal layer is no longer the primary source of truth.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final validation for the Jotai migration.

- [X] T014 [P] Update `docs/architecture.md` and `docs/how-it-works.md` to describe the new spec-viewer atom store and the extension-to-webview snapshot boundary
- [X] T015 [P] Validate the walkthrough in `specs/120-jotai-webview-state/quickstart.md` against the final implementation and adjust the text if the final wiring differs
- [X] T016 [P] Run the manual end-to-end smoke check described in `specs/120-jotai-webview-state/quickstart.md` to verify reload restoration and consistent shared state across the spec viewer

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion and can then proceed in priority order.
- **Polish (Phase 6)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational completion and delivers the shared viewer-state MVP.
- **User Story 2 (P2)**: Can start after Foundational completion and focuses on extension-to-webview hydration.
- **User Story 3 (P3)**: Can start after Foundational completion and focuses on derived state and signal cleanup.

### Within Each User Story

- Shared base atoms before component consumers.
- Provider wiring before component consumers.
- Bridge hydration before derived-state cleanup.
- Storybook helper before story file updates.
- Cleanup only after all consumers are moved.

### Parallel Opportunities

- T004 and T005 can run in parallel because they touch different component groups.
- T006 can run in parallel with T004/T005 once the atom model exists.
- T008 and T009 can run in parallel if the snapshot shape stays stable.
- T010 and T011 can run in parallel after the shared store exists.
- T014 and T015 can run in parallel during polish.

---

## Parallel Example: User Story 1

```bash
Task: "Refactor webview/src/spec-viewer/components/NavigationBar.tsx, webview/src/spec-viewer/components/SpecHeader.tsx, and webview/src/spec-viewer/components/StaleBanner.tsx to subscribe to the shared atoms"
Task: "Refactor webview/src/spec-viewer/components/FooterActions.tsx and webview/src/spec-viewer/components/ElapsedTimer.tsx to read the same atom-backed viewer state so the footer and timer stay aligned with the rest of the shell"
Task: "Refactor webview/src/spec-viewer/components/ActivityPanel.tsx, webview/src/spec-viewer/components/StepTab.tsx, and webview/src/spec-viewer/editor/restoreComments.ts to consume atom-backed shared state or derived selectors instead of the old signal reads"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate the shell state coherence before expanding the migration.

### Incremental Delivery

1. Add the Jotai dependency and base atoms.
2. Migrate the shared spec-viewer shell to atoms.
3. Route extension snapshots through one hydration path.
4. Move derived viewer outputs to atoms and clean up the legacy shared-signal layer.
5. Update docs and run a manual smoke test from `quickstart.md`.

### Notes

- Keep the migration scoped to `webview/src/spec-viewer`.
- Preserve the extension-side manager architecture and file-backed source of truth.
- Do not introduce a new external message contract unless a later task proves it is required.
