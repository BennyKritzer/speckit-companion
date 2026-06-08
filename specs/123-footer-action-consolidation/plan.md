# Implementation Plan: Footer Action Consolidation

**Branch**: `123-footer-action-consolidation` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/123-footer-action-consolidation/spec.md`

## Summary

Consolidate the spec viewer's interactive chrome into the footer so the navigation bar no longer duplicates action buttons. The only navigation-bar exception is the activity view toggle. The implementation is a focused UI routing change: remove the approve button branch from `NavigationBar.tsx`, keep the existing footer action rendering path as the single action surface, and refresh the viewer stories and docs so the new placement rule is explicit.

## Technical Context

**Language/Version**: TypeScript 5.3+ (ES2022, strict mode)  
**Primary Dependencies**: VS Code Extension API (`@types/vscode ^1.84.0`), Preact (webview), Jotai-style store atoms in the webview  
**Storage**: Workspace files under `specs/<feature>/` plus `.spec-context.json`; no new persisted data shape  
**Testing**: Jest + ts-jest for extension-side logic, Storybook stories for webview states, manual Extension Development Host smoke testing  
**Target Platform**: VS Code desktop webview on Linux, macOS, and Windows  
**Project Type**: VS Code extension with webview UI (single project)  
**Performance Goals**: Preserve the existing render path; no new polling, state fetches, or message types  
**Constraints**: Keep the activity view toggle in the navigation bar, avoid duplicating any other interactive control between nav and footer, and preserve existing footer behavior for approve/archive/reactivate states  
**Scale/Scope**: One nav bar component, one footer component, the footer action catalog, two story files, and the associated footer/navigation CSS partials

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Extensibility and Configuration** — PASS. No new settings or workflow knobs are introduced; the feature only relocates existing controls.
- **II. Spec-Driven Workflow** — PASS. The change preserves the current workflow and only changes where interactive chrome is rendered.
- **III. Visual and Interactive** — PASS. The requested behavior is a direct visual simplification: one action surface, one nav-bar exception.
- **IV. Modular Architecture for Complex Features** — PASS. The change stays inside the existing modular webview structure and its associated styles/stories.

No violations. No complexity-tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/123-footer-action-consolidation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── spec.md
```

No `contracts/` directory is generated for this feature because it does not introduce a new external interface or message contract; it reuses the existing viewer state and command plumbing.

### Source Code (repository root)

```text
webview/src/spec-viewer/components/
├── NavigationBar.tsx
├── NavigationBar.stories.tsx
├── FooterActions.tsx
└── FooterActions.stories.tsx

webview/styles/spec-viewer/
├── _navigation.css
└── _footer.css

src/features/spec-viewer/
├── footerActions.ts
└── __tests__/footerActions.test.ts
```

**Structure Decision**: Single-project VS Code extension layout with the feature implemented in the webview UI and verified through the existing extension-side test harness and component stories.

## Phase 0: Research

Research result: the current implementation already has a single canonical footer action surface, while `NavigationBar.tsx` still renders an approve button in the nav-right area. The smallest safe plan is to remove that nav-side approve branch, keep the activity toggle in place, and rely on the existing footer rendering path and footer action catalog for every other interactive control.

### Decision 1: Make the navigation bar activity-only

Decision: remove the approve button block from `webview/src/spec-viewer/components/NavigationBar.tsx` so the navigation bar contains only the activity view toggle as an interactive control.

Rationale: this is the smallest change that satisfies the feature request and avoids creating a second action renderer.

Alternatives considered: leaving approve in both nav and footer (rejected because it preserves the duplicate-control problem) and moving all chrome into a new shared wrapper component (rejected as unnecessary refactoring).

### Decision 2: Keep FooterActions as the single action surface

Decision: leave the footer action rendering path as the source of truth for all other interactive viewer controls.

Rationale: the footer already owns lifecycle actions, scope-aware buttons, and the generated/idle states; reusing it avoids new state plumbing.

Alternatives considered: moving footer action logic into NavigationBar or a new shared layout module (rejected because the footer already contains the right behavior and layout regions).

### Decision 3: Validate with existing stories and narrow-width smoke tests

Decision: rely on the existing `NavigationBar.stories.tsx` and `FooterActions.stories.tsx` coverage, plus a manual narrow-panel check in the Extension Development Host.

Rationale: the behavior change is about placement and duplication, not new data flow, so visual validation is the right scope.

Alternatives considered: adding a new integration harness or a custom resize test fixture (rejected until the simpler visual checks prove insufficient).

## Phase 1: Design & Contracts

### Component and layout changes

1. Remove the `ns.footerState?.showApproveButton` branch from `webview/src/spec-viewer/components/NavigationBar.tsx`.
2. Keep the `activity-toggle` button and its `handleActivityToggle` behavior unchanged.
3. Confirm the footer continues to render approve, archive, reactivate, regenerate, and other action buttons through `FooterActions.tsx` and the footer action catalog.
4. Update `NavigationBar.stories.tsx` so the nav bar story set reflects the activity-only interactive surface.
5. Refresh `FooterActions.stories.tsx` only if a story snapshot needs to assert the footer remains the sole action surface for the approve/lifecycle controls.

### Documentation updates required by the feature

1. Update `README.md` to describe the footer as the canonical action surface and the activity toggle as the sole nav-bar exception.
2. Update `docs/viewer-states.md` if any footer-button matrix text needs to reflect the new placement rule.

### Contracts

No external contracts are introduced. The feature reuses the current extension ↔ webview messages and the existing derived nav/footer state.

### Agent context update

Update the marker block in `.github/copilot-instructions.md` so it points to `specs/123-footer-action-consolidation/plan.md`.

## Complexity Tracking

> No Constitution Check violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| (none) | — | — |

## Plain-English Summary

The viewer currently shows an approve button in the navigation bar and a separate set of actions in the footer. This plan removes the navigation-bar duplicate and makes the footer the only home for interactive controls, except for the activity view toggle.
