# Research & Decisions

## 1. Skipped State representation in `.spec-context.json`

- **Decision**: Represent skipped steps by logging a new `kind: "skip"` action in the `history` array. Wait, let's stick to the current schema we just read, which only allows `kind: ["start", "complete"]`. If we change `kind` we need to modify the schema. Actually, since the `kind` enum in `.spec-context.json` is `start | complete`, we must either modify the schema or find another way. We can extend the schema to allow `skip` in `kind` or set `completedAt` to some special null value, but it is better to modify the schema `kind: ["start", "complete", "skip"]`. 
- **Rationale**: A direct `"skip"` action perfectly matches the append-only log strategy and communicates clear intent.
- **Alternatives considered**: Appending `{ kind: "complete" }` with an extra `skipped: true` boolean. This complicates the base schema across the board. Expanding the enum is cleaner.

## 2. Footer "Skip" Button Action

- **Decision**: Send a new message `type: "skipStep"` from the webview to the extension. The extension will append the skip history state and return.
- **Rationale**: Minimal interference with the `approveNext` logic.
- **Alternatives considered**: Adding it to the `approveNext` command as an argument.

## 3. UI Visualization

- **Decision**: In `StepTab`, skipped steps will render with a muted or strikethrough visual to differentiate from `in-flight` and `done` (completed). In `PhasesCard`, skipped steps will display "Skipped" and zero active duration.
- **Rationale**: Meets user requirements concisely.
