# Research Notes: Footer Action Consolidation

## Decision 1: Navigation bar should be activity-only

Decision: remove the approve button branch from `webview/src/spec-viewer/components/NavigationBar.tsx` and leave the activity view toggle as the only interactive control in that chrome area.

Rationale: the current nav implementation already isolates the duplicate control to one branch, so removing it is the smallest change that satisfies the feature request.

Alternatives considered: keeping approve in both nav and footer (rejected because it preserves duplication) and introducing a new shared chrome wrapper (rejected as unnecessary refactoring for a one-control move).

## Decision 2: FooterActions remains the canonical action surface

Decision: keep `webview/src/spec-viewer/components/FooterActions.tsx` and the footer action catalog in `src/features/spec-viewer/footerActions.ts` as the source of truth for viewer actions.

Rationale: the footer already owns lifecycle, regenerate, archive, reactivate, and approve-related behavior, so the feature should reuse that structure instead of splitting responsibility.

Alternatives considered: moving footer logic into the navigation bar or a new top-level layout orchestrator (rejected because the existing footer pipeline already has the right behavior and tests).

## Decision 3: Validate placement with existing stories and a narrow-width smoke test

Decision: use the current `NavigationBar.stories.tsx` and `FooterActions.stories.tsx` stories plus a manual narrow-panel check in the Extension Development Host to confirm the placement change.

Rationale: the feature is visual and layout-oriented, so the existing component story baseline is the most direct verification surface.

Alternatives considered: adding a dedicated layout test harness or a new resize automation pass (rejected until the visual stories prove insufficient).

## Implementation notes from current code

- `NavigationBar.tsx` currently renders the approve button in `.nav-right-actions` and the activity toggle beside it.
- `FooterActions.tsx` already owns the footer action surface and the approve button in the catalog-driven path.
- `src/features/spec-viewer/footerActions.ts` already models approve, regenerate, archive, reactivate, skip, and unskip as footer actions, so no new footer action schema is needed.
- The feature therefore does not require new messages, new persisted data, or new view-state fields.