# Tasks: Footer Action Consolidation

**Input**: Design documents from `/specs/123-footer-action-consolidation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No automated test tasks generated. The spec's acceptance criteria are covered by the existing Storybook stories plus manual viewer checks in the Extension Development Host.

**Organization**: Tasks are grouped by user story so each viewer state can be implemented and verified independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new setup required — this feature edits existing webview and docs files only.

_(intentionally empty)_

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational work required — the footer action catalog, nav-state derivation, and activity toggle already exist.

_(intentionally empty)_

---

## Phase 3: User Story 1 - Navigation Bar Becomes Activity-Only (Priority: P1) 🎯 MVP

**Goal**: Remove the duplicate approve control from the navigation bar so the only interactive control left there is the activity view toggle.

**Independent Test**: Open the main viewer states and confirm the navigation bar shows only the activity toggle while the footer continues to own the action buttons.

### Implementation for User Story 1

- [X] T001 [P] [US1] Remove the `ns.footerState?.showApproveButton` branch from `webview/src/spec-viewer/components/NavigationBar.tsx`, keeping the `activity-toggle` button and `handleActivityToggle` logic intact so the header's interactive surface is activity-only.
- [ ] T002 [P] [US1] Update `webview/src/spec-viewer/components/NavigationBar.stories.tsx` so the active, completed, and archived header stories exercise the activity-only navigation bar and no longer snapshot an approve button in the header.
- [ ] T003 [US1] Manually verify in the Extension Development Host that the navigation bar shows only the activity view toggle across the main viewer states, that non-action header chrome remains unchanged apart from the removed approve button, and that the footer continues to provide the action controls unchanged.

**Checkpoint**: The navigation bar is activity-toggle only, and no action button is duplicated there.

---

## Phase 4: User Story 2 - Footer Is the Sole Action Surface (Priority: P2)

**Goal**: Keep approve, archive, reactivate, regenerate, and related controls in the footer only, with no duplicate action buttons between header and footer.

**Independent Test**: Cycle through the supported viewer states and confirm each interactive control appears in one place only.

### Implementation for User Story 2

- [ ] T004 [P] [US2] Refresh `webview/src/spec-viewer/components/FooterActions.stories.tsx` (and any supporting story args if needed) so the footer snapshots clearly show approve, archive, reactivate, regenerate, and other action buttons remaining in the footer after the navigation-bar approve control is removed.
- [ ] T005 [US2] Manually verify the active, completed, archived, and in-flight footer modes to confirm there are no duplicate action controls between `webview/src/spec-viewer/components/NavigationBar.tsx` and `webview/src/spec-viewer/components/FooterActions.tsx`, and that the footer remains the single action surface.

**Checkpoint**: Every action control is rendered in exactly one place, and the footer owns the action surface.

---

## Phase 5: User Story 3 - Footer Stays Usable in Narrow Layouts (Priority: P3)

**Goal**: Keep the consolidated footer readable and usable when the viewer panel is narrow, while the activity toggle stays in the navigation bar.

**Independent Test**: Narrow the viewer and confirm the footer controls wrap or compress without overlap or hidden actions.

### Implementation for User Story 3

- [ ] T006 [P] [US3] Adjust `webview/styles/spec-viewer/_footer.css` and, if needed, `webview/styles/spec-viewer/_navigation.css` so the consolidated footer controls continue to wrap or shrink cleanly in narrow panels without overlapping the activity-toggle slot.
- [ ] T007 [US3] Manually verify narrow-panel behavior in the Extension Development Host, including footer control wrapping/compression, no overlap or hidden controls, and the activity view toggle remaining available in the navigation bar.

**Checkpoint**: Narrow layouts remain usable, and the activity toggle still stays in the navigation bar.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final validation.

- [X] T008 [P] Update `README.md` and `docs/viewer-states.md` to describe the footer as the canonical action surface and the activity view toggle as the sole navigation-bar exception.
- [X] T009 Run `npm run compile` from the repository root and `git diff --check` to confirm the nav/footer placement edits, story updates, and docs changes remain clean.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion, but this feature has no blocking foundational work.
- **User Stories (Phase 3+)**: Depend on the existing viewer implementation and can proceed in priority order after the plan is in place.
- **Polish (Final Phase)**: Depends on the user story work being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately and unlocks the nav-bar simplification.
- **User Story 2 (P2)**: Depends on US1 because the footer-only action surface is easiest to verify once the navigation-bar approve control is removed.
- **User Story 3 (P3)**: Depends on US1 because the narrow-layout check is validating the post-consolidation footer layout.

### Within Each User Story

- T001 and T002 can run in parallel because they touch different files.
- T003 should run after the nav-bar edits and story refresh land.
- T004 can run in parallel with T006 because they touch different files.
- T005 and T007 are manual verification tasks and should follow the corresponding implementation edits.

### Parallel Opportunities

- T001 ∥ T002 within Phase 3.
- T004 ∥ T006 across Phases 4 and 5.
- T008 can run in parallel with T009 once the code and doc edits are complete.

---

## Parallel Example: User Story 1

```bash
Task: "Remove the approve button branch from webview/src/spec-viewer/components/NavigationBar.tsx"
Task: "Update webview/src/spec-viewer/components/NavigationBar.stories.tsx for the activity-only header state"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: remove the navigation-bar approve control and update the header stories.
2. STOP and VALIDATE: confirm the navigation bar only exposes the activity toggle.
3. If the header is correct, proceed to the footer-surface verification in US2.

### Incremental Delivery

1. US1: make the navigation bar activity-only.
2. US2: verify the footer remains the single action surface.
3. US3: confirm the consolidated footer still behaves well in narrow layouts.
4. Polish: update the docs and run the final compile / diff checks.

### Parallel Team Strategy

With multiple contributors:

1. One contributor handles US1 in `NavigationBar.tsx` and `NavigationBar.stories.tsx`.
2. A second contributor validates the footer action surface and story snapshots for US2.
3. A third contributor handles the narrow-layout CSS and manual verification for US3.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] labels map each task to the corresponding user story from spec.md.
- This feature has no automated test tasks because the spec did not request TDD; acceptance is verified through the existing stories and manual viewer checks.
- Avoid splitting the NavigationBar removal across multiple edits; the approve-button branch should be removed as one focused change.