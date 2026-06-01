# Implementation Plan: Jotai Webview State Management

**Branch**: `120-jotai-webview-state` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/120-jotai-webview-state/spec.md`

## Summary

Introduce Jotai as the shared reactive state layer for the spec-viewer webview only. The extension side continues to own file-backed state and workflow authority, while the webview receives extension snapshots and derives all shared viewer state from atoms instead of ad hoc local state and prop drilling. The migration should focus on the spec-viewer subtree, preserve the existing manager/provider architecture, and keep the extension-webview message bridge as the sync boundary.

## Technical Context

**Language/Version**: TypeScript 5.3+ (ES2022 target, strict mode)
**Primary Dependencies**: VS Code Extension API (`@types/vscode ^1.84.0`), Preact, Jotai
**Storage**: File-based workspace state (`.spec-context.json`, spec markdown files, existing extension-managed state); webview Jotai state is in-memory only
**Testing**: Jest + ts-jest for extension code, manual webview verification, existing webview test/story coverage where available
**Target Platform**: VS Code desktop extension host plus webview browser context
**Project Type**: Single VS Code extension with extension-host and webview runtime
**Performance Goals**: Keep webview updates coherent and reactive; extension snapshots should propagate without manual refresh and remain visually consistent within one render pass
**Constraints**: Do not move file persistence into the webview; do not change the extension's manager-based architecture; keep the scope limited to the spec-viewer webview; preserve the existing message bridge as the synchronization boundary
**Scale/Scope**: One webview subtree (`webview/src/spec-viewer`), its supporting store modules, and the related extension-side message routing and provider wiring

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Extensibility and Configuration**: PASS. Jotai is introduced only inside the spec-viewer webview and does not hard-code new extension configuration or alter provider selection.
- **II. Spec-Driven Workflow**: PASS. The extension remains the source of truth for spec files and workflow state; the webview store only reflects and derives from those snapshots.
- **III. Visual and Interactive**: PASS. The feature is explicitly a webview state-management improvement that reduces inconsistent UI and makes viewer interactions more reliable.
- **IV. Modular Architecture for Complex Features**: PASS. The change fits the existing split between extension-side providers/message handlers and webview-side UI/state modules, and the plan keeps state logic in focused store modules instead of expanding component-local state.

No violations require justification.

## Project Structure

### Documentation (this feature)

```text
specs/120-jotai-webview-state/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── features/
│   └── spec-viewer/
│       ├── messageHandlers.ts
│       ├── specViewerProvider.ts
│       └── stateDerivation.ts
└── core/
    └── types/
        └── specContext.ts

webview/
└── src/
    └── spec-viewer/
        ├── App.tsx
        ├── components/
        │   ├── FooterActions.tsx
        │   └── ElapsedTimer.tsx
        ├── signals.ts
        ├── types.ts
        └── store/
            └── atoms.ts
```

**Structure Decision**: Keep the existing single-project VS Code extension layout and introduce a small webview store module under `webview/src/spec-viewer/store/` for the Jotai atoms and derived selectors. The extension-side message handlers remain the bridge that hydrates the store from authoritative file-backed snapshots.

## Phase 0: Research

Research is complete enough to proceed without additional open questions. The key decisions are:

- Jotai is scoped to the spec-viewer webview only.
- The extension continues to own persistence, lifecycle transitions, and spec context updates.
- The webview store should model the latest snapshot plus derived viewer state, not duplicate the extension's source-of-truth logic.
- The migration should favor a narrow, incremental refactor of the spec-viewer subtree over a broad cross-webview rewrite.

## Phase 1: Design & Contracts

### Data model

Model the webview store around a base snapshot and derived selectors:

- `activeSpecAtom` for the currently selected spec context.
- `specContentAtom` for the active spec document content shown in the viewer.
- `navigationAtom` for the current tab/document selection and related navigation state.
- `uiStateAtom` for local viewer flags such as loading, visibility, and transient interaction state.
- derived atoms for footer visibility, badge/timeline state, and other computed viewer outputs that should remain consistent across components.

### Contracts

No new external contracts are introduced. The feature uses the existing extension-to-webview message bridge and does not add new public APIs, endpoints, or file formats.

### Agent context update

Update the `<!-- SPECKIT START -->` block in `.github/copilot-instructions.md` to point to `specs/120-jotai-webview-state/plan.md`.

## Complexity Tracking

No Constitution Check violations were identified, so Complexity Tracking is intentionally empty.
