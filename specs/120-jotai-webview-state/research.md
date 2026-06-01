# Research: Jotai Webview State Management

## Decision 1: Scope Jotai to the spec-viewer webview only

- **Decision**: Introduce Jotai only inside `webview/src/spec-viewer`, not across every webview surface.
- **Rationale**: The feature requirement is explicitly bounded to the spec-viewer, and that area has the most shared, derived UI state. Limiting the scope reduces migration risk and avoids unnecessary churn in unrelated webviews.
- **Alternatives considered**: A repo-wide webview state layer was considered, but it would broaden the blast radius without a user requirement to justify it.

## Decision 2: Keep the extension as the source of truth

- **Decision**: Preserve the extension-host managers and file-backed workflow state as authoritative, and hydrate the webview store from extension snapshots.
- **Rationale**: The repository architecture already centers file-backed state and extension-side orchestration. Jotai should improve reactivity in the browser UI, not replace persistence or workflow control.
- **Alternatives considered**: Moving state ownership into the webview would simplify local rendering but would violate the existing architecture and fragment persistence.

## Decision 3: Use a small base snapshot plus derived atoms

- **Decision**: Model the webview store with a base snapshot atom and derived atoms for navigation, footer visibility, badges, and other computed viewer state.
- **Rationale**: The viewer already derives many UI cues from a single underlying spec context. Derived atoms keep those computations centralized and consistent across components.
- **Alternatives considered**: Keeping all state in component-local hooks would preserve the current fragmentation problem. A monolithic context object would reduce some prop drilling but would not give the same fine-grained updates as Jotai.

## Decision 4: Preserve the existing message bridge as the sync boundary

- **Decision**: Continue using extension messages to move data into the webview and let the store react to those messages.
- **Rationale**: The message bridge is already the boundary between authoritative file changes and the browser runtime. Reusing it keeps synchronization explicit and testable.
- **Alternatives considered**: Polling the file system from the webview or duplicating extension logic in the browser would both create unnecessary complexity and risk drift.

## Decision 5: Migrate incrementally

- **Decision**: Introduce Jotai alongside the current webview structure and migrate the shared spec-viewer state first.
- **Rationale**: A narrow migration is easier to validate and keeps the feature aligned with the repo's modular architecture guidance.
- **Alternatives considered**: A full rewrite of every signal/hook in one pass was rejected because it would make review and rollback harder without improving the user outcome.
