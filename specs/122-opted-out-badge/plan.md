# Implementation Plan: Opted Out Badge

**Branch**: `122-opted-out-badge` | **Date**: 2026-06-08 | **Spec**: [specs/122-opted-out-badge/spec.md](specs/122-opted-out-badge/spec.md)
**Input**: Feature specification from `/specs/122-opted-out-badge/spec.md`

## Summary

Replace the wide optional label in the Spec Viewer navigation with a compact opted-out indicator for optional steps that have not been run, while leaving run optional steps on the normal tab presentation. The change uses existing optional-step metadata already present in workflow definitions and viewer document models, so the implementation is constrained to navigation rendering, state propagation, and the related tests.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.3+ (ES2022 target, strict mode)  
**Primary Dependencies**: VS Code Extension API (`@types/vscode ^1.84.0`), Preact webview  
**Storage**: File-based workspace docs and `.spec-context.json`  
**Testing**: Jest (`npm test`), TypeScript compiler (`npm run compile`)  
**Target Platform**: VS Code on Linux, Windows, macOS, and WSL  
**Project Type**: single extension with extension-host and webview code paths  
**Performance Goals**: Keep navigation rendering compact and responsive with no noticeable tab-layout flicker  
**Constraints**: Preserve existing optional-step semantics; do not introduce new workflow schema fields  
**Scale/Scope**: Limited to the Spec Viewer navigation, workflow step metadata propagation, and supporting tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Extensibility and Configuration** — PASS. The feature reuses the existing `optional` workflow field and does not hard-code a new workflow schema.
- **II. Spec-Driven Workflow** — PASS. The badge reflects workflow step state without changing lifecycle ordering or approval semantics.
- **III. Visual and Interactive** — PASS. The change is purely user-facing in the navigation banner and preserves the interactive viewer model.
- **IV. Modular Architecture for Complex Features** — PASS. The work stays within the existing viewer, document-scanner, and workflow-step modules.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
src/
├── core/
│   └── types/
│       └── specContext.ts
├── features/
│   ├── spec-viewer/
│   │   ├── documentScanner.ts
│   │   ├── messageHandlers.ts
│   │   └── types.ts
│   └── workflows/
│       └── types.ts
webview/
└── src/spec-viewer/
    ├── components/
    │   └── StepTab.tsx
    └── types.ts
```

**Structure Decision**: Keep the feature inside the existing single extension layout, with a small extension-side data propagation change and a corresponding webview rendering update.

## Phase 0: Research

- Confirm the compact opted-out state should display as a small `OO` badge or a compact icon in the available banner space.
- Verify the feature can reuse the existing `optional` field on workflow steps and does not need schema changes.
- Confirm the run-state transition should remove the badge entirely and return the tab to its normal presentation.

## Phase 1: Design

- Update the viewer-side document model to carry the optional-step display state from the scanner to the tab renderer.
- Update the workflow step scan payload so optional steps remain visible as normal tabs when they are active or have been run.
- Update the `StepTab` rendering path so the compact badge only appears for unrun optional steps.
- Update the relevant tests and docs so the badge behavior is exercised and described consistently.
