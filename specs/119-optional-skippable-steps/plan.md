# Implementation Plan: Optional Skippable Steps

**Branch**: `119-optional-skippable-steps` | **Date**: May 31, 2026 | **Spec**: [specs/119-optional-skippable-steps/spec.md](spec.md)
**Input**: Feature specification from `specs/119-optional-skippable-steps/spec.md`

## Summary

This feature introduces an `optional` or `skippable` boolean attribute to workflow steps, specifically targeting Clarify, Analyze, Checklist, and Git Validate in the default SpecKit workflow. A new "Skip" button will appear in the UI footer for these steps, allowing the user to bypass them and transition the step's state to "Skipped". The completion calculator and the activity timeline will handle these skipped states natively by ignoring them from math and rendering them distinctly in the UI.

## Technical Context

**Language/Version**: TypeScript 5.3+ (ES2022 target, strict mode)
**Primary Dependencies**: VS Code Extension API (`@types/vscode ^1.84.0`), Preact (webview)
**Storage**: File-based `.spec-context.json`
**Testing**: Jest (extension), testing via IDE
**Target Platform**: VS Code Extension
**Project Type**: single extension (Extension Host + Webview)
**Performance Goals**: Instant UI updates when skipping steps
**Scale/Scope**: Impacts workflow schemas and step rendering across the extension

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Extensibility and Configuration**: PASS (Extending `WorkflowStepConfig` is backward compatible and flexible for custom workflows).
- **II. Spec-Driven Workflow**: PASS (Maintains the spec-driven phased state machine with a new valid 'skipped' bypass mode without breaking sequential nature).
- **III. Visual and Interactive**: PASS (UI footer action and Timeline indicator specifically addresses visual interaction priority).
- **IV. Modular Architecture for Complex Features**: PASS (Modifications logically fit within the existing `messageHandlers`, `specViewerProvider`, and Preact component modules).

## Project Structure

### Documentation (this feature)

```text
specs/119-optional-skippable-steps/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── core/
│   └── types/
│       └── specContext.ts
├── features/
│   ├── spec-viewer/
│   │   ├── footerActions.ts
│   │   ├── messageHandlers.ts
│   │   └── specViewerProvider.ts
│   ├── specs/
│   │   └── stepHistoryDerivation.ts
│   └── workflows/
│       └── workflowManager.ts
webview/
└── src/spec-viewer/
    ├── App.tsx
    ├── components/
    │   ├── FooterActions.tsx
    │   ├── StepTab.tsx
    │   └── cards/
    │       └── PhasesCard.tsx
    └── types.ts
```

**Structure Decision**: The feature natively injects into the single project layout currently used by the extension without restructuring.
