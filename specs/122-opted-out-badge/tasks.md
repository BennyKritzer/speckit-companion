# Tasks: Opted Out Badge

## Execution Plan
**Feature**: Opted Out Badge
**Total Tasks**: 11
**Suggested MVP**: Complete Phase 2 (Foundational) and Phase 3 (US1 - compact unrun state) first.

## Dependency Graph
Phase 1 (Setup) -> Phase 2 (Foundational) -> Phase 3 (US1) -> Phase 4 (US2) -> Phase 5 (Polish)

## Parallel Execution Examples
- In Phase 2, the StepTab render helper and the compact badge CSS can be worked on in parallel because they touch different files.
- In Phase 5, the README and viewer-states doc updates can proceed in parallel while the implementation is already complete.

---

## Phase 1: Setup
*Goal: Add visual coverage for the compact badge variants before changing the viewer behavior.*

- [X] T001 [P] Add compact opted-out story variants in `webview/src/spec-viewer/components/StepTab.stories.tsx` so the new badge states have a visual baseline.

---

## Phase 2: Foundational
*Goal: Introduce the shared badge decision and styling primitives that the viewer will use for optional tabs.*

**⚠️ CRITICAL**: No user-story work should be considered complete until the compact badge decision and styling are aligned.

- [X] T002 Update `webview/src/spec-viewer/components/StepTab.tsx` with a shared helper that decides when an optional tab should show the compact opted-out marker.
- [X] T003 [P] Add compact badge sizing and spacing rules in `webview/styles/spec-viewer/_navigation.css`.

**Checkpoint**: The viewer has a shared compact-badge path and can distinguish unrun optional tabs from normal tabs.

---

## Phase 3: User Story 1 - Compact Unrun State (Priority: P1) 🎯 MVP

**Goal**: Unrun optional steps show a compact opted-out indicator so the navigation stays readable without the wider optional label.

**Independent Test**: Open a spec with optional steps that have not been run and confirm each unrun optional tab shows the compact marker instead of the larger optional label.

### Implementation for User Story 1

- [X] T004 [US1] Render the compact opted-out marker for unrun optional steps in `webview/src/spec-viewer/components/StepTab.tsx`.
- [X] T005 [P] [US1] Expand `webview/src/spec-viewer/components/StepTab.stories.tsx` with the unrun optional state and a normal non-optional comparison state.

**Checkpoint**: User Story 1 is complete when unrun optional steps are visibly compact in the navigation banner.

---

## Phase 4: User Story 2 - Return To Normal Presentation After Run (Priority: P2)

**Goal**: Once an optional step has been run, the tab returns to the normal step presentation with no compact opted-out marker.

**Independent Test**: Run any optional step and confirm its tab returns to the normal step presentation without the compact marker.

### Implementation for User Story 2

- [X] T006 [US2] Hide the compact marker once optional steps have been started, completed, or skipped in `webview/src/spec-viewer/components/StepTab.tsx`.
- [X] T007 [P] [US2] Update `docs/viewer-states.md` to describe when the compact marker appears and disappears.

**Checkpoint**: User Story 2 is complete when run optional steps look like normal tabs and no longer consume extra navigation space.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and final regression checks.

- [X] T008 [P] Update `README.md` "Reading Specs" and "Spec Viewer" sections to document the compact opted-out marker behavior.
- [X] T009 [P] Run `npm run compile` and fix any regressions introduced by the badge change in `webview/src/spec-viewer/components/StepTab.tsx` and `webview/styles/spec-viewer/_navigation.css`.
- [X] T010 [P] Validate the compact layout in Storybook using `webview/src/spec-viewer/components/StepTab.stories.tsx` and `webview/src/spec-viewer/components/NavigationBar.stories.tsx` at a narrow viewport.
- [X] T011 [P] Run `npm run build-storybook` to confirm the story set still builds after the badge change.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story work until the shared badge rendering path is in place.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Final Phase)**: Depends on all implementation tasks being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) and delivers the MVP compact-unrun experience.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) and is independent of documentation polish.

### Within Each User Story

- Core implementation should happen before documentation or validation updates.
- User Story 1 should land before User Story 2 because it defines the compact marker shown for unrun steps.
- Story work should remain localized to the viewer/navigation files unless a doc update is required.

### Parallel Opportunities

- T002 and T003 can run in parallel because they touch different files.
- T005 can run in parallel with later documentation work because it only expands the story baseline.
- T007 and T008 can run in parallel because they affect different documentation files.
- T009 and T010 can run in parallel once the implementation is complete.

---

## Parallel Example: User Story 1

```bash
# Launch the visual implementation tasks together:
Task: "Render the compact opted-out marker for unrun optional steps in webview/src/spec-viewer/components/StepTab.tsx"
Task: "Expand webview/src/spec-viewer/components/StepTab.stories.tsx with the unrun optional state and a normal non-optional comparison state"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate the compact unrun state in the viewer.

### Incremental Delivery

1. Setup + Foundational establish the compact badge plumbing.
2. User Story 1 makes unrun optional steps visibly compact.
3. User Story 2 removes the marker after the step has been run.
4. Polish updates docs and verifies the full walkthrough.

### Parallel Team Strategy

1. One developer can update `StepTab.tsx` while another tunes `navigation.css`.
2. Once the shared rendering path is stable, docs and validation can be completed independently.
3. The final validation pass can happen after the feature is visually stable in the viewer.
