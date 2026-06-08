# Research Notes: Opted Out Badge

## Decisions

- Use a compact opt-out marker for unrun optional steps and keep run optional steps on the normal tab presentation.
- Prefer the smallest readable form in the navigation banner: an `OO` badge is acceptable, and a compact icon may be used when it fits better.
- Reuse the existing `optional` workflow-step metadata already present in the workflow configuration and viewer document models.
- Do not introduce new workflow schema fields or external contracts for this feature.

## Rationale

- The current optional label is too wide for the navigation banner, so the new state must be materially smaller while remaining obvious.
- The feature is a pure presentation change on top of existing optional-step state, so it should stay within the current extension and webview boundaries.
- Keeping the run-state presentation unchanged avoids introducing new visual states that would complicate the stepper and the tests.

## Alternatives Considered

- Keeping the current optional label and only tightening spacing was rejected because it does not solve the space complaint.
- Showing a larger icon-plus-label variant was rejected because it still consumes too much width in the banner.
- Adding a new persisted workflow field was rejected because the existing optional metadata already captures the needed state.
