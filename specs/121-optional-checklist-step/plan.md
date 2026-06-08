# Implementation Plan: Optional Clarify, Checklist, and Analyze Steps & ACP Race Condition Resolution

**Branch**: `121-optional-checklist-step` | **Date**: 2026-06-07 | **Spec**: [specs/121-optional-checklist-step/spec.md](specs/121-optional-checklist-step/spec.md)
**Input**: Feature specification from `specs/121-optional-checklist-step/spec.md`

---

## Summary

This plan covers redesigning the Speckit default workflow to integrate three optional steps at optimal stages (Clarify, Checklist, and Analyze) and fixing a critical asynchronous completion race condition in the ACP (Agent Connection Protocol) provider. The checklist step will have its own tab in the Spec Viewer (not masked as action-only) to show generated checklist documents. 

Additionally, we add an `optional` attribute to documents / workflow step models so the navigation bar rendering is fully aware and displays appropriate visual labels.

---

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode, ES2022)  
**Primary Dependencies**: VS Code Extension API (`@types/vscode ^1.84.0`), Preact (Webview UI)  
**Storage**: File-based `.spec-context.json`  
**Testing**: Jest with `ts-jest`  
**Target Platform**: Linux, Windows, macOS, WSL  
**Project Type**: VS Code Extension & Webview-based GUI  
**Performance Goals**: Instant tab rendering and state derivations without visual flicker  
**Constraints**: Append-only transition history enforcement

---

## Constitution Check

*GATE: Must pass before Phase 1 design.*

- **Principle I: Extensibility and Configuration** - YES. Optional workflow step modifications utilize pre-existing properties allowing full user settings overriding.
- **Principle II: Spec-Driven Workflow** - YES. Retains the correct sequence and leverages clear lifecycle status updates.
- **Principle III: Visual and Interactive Indicator** - YES. Optional badge design adds descriptive visual indicator chips matching VS Code themes natively.
- **Principle IV: Modular Architecture** - YES. Extension side separates webview actions, commands, and providers into distinct boundaries.

---

## Proposed Technical Changes

To address both the optional steps ordering/visibility and the race condition, we will modify five key areas:

### 1. Register step name parameter in AI provider models
Modify `src/ai-providers/aiProvider.ts` to accept `step` in `AIOptions`, and update `acpProvider.ts` to capture the step name at execution startup.
```typescript
// src/ai-providers/aiProvider.ts
export interface AIOptions {
    model?: string;
    agent?: string;
    continue?: boolean;
    autoExecute?: boolean;
    specDir?: string;
    step?: string; // Captures the exact workflow step under execution
}
```

```typescript
// src/ai-providers/acpProvider.ts
async executeInTerminal(prompt: string, title: string = 'SpecKit - ACP', options?: AIOptions): Promise<vscode.Terminal> {
    const capturedSpecDir = options?.specDir || await getActiveSpecDir();
    // Capture the executing step name synchronously at startup!
    const stepName = options?.step || readSpecContextSync(capturedSpecDir)?.currentStep || 'specify';

    // ... inside onCompletion:
    const onCompletion = async () => {
        try {
            if (capturedSpecDir) {
                // Use the static stepName captured on spawn, NOT the dynamic active step!
                await completeStep(capturedSpecDir, stepName as StepName, 'ai');
            }
        } catch (e) { ... }
    }
}
```

### 2. Supply step name on terminal execution dispatch
In both `specCommands.ts` (`executeWorkflowStep`) and `messageHandlers.ts` (`executeStepInTerminal`), supply the executing step name in the dispatched `AIOptions`.
```typescript
// src/features/specs/specCommands.ts
let aiOptions: AIOptions | undefined = stepConfig ? {
    agent: stepConfig.agent,
    model: stepConfig.model,
    continue: stepConfig.continue,
    step: stepConfig.name // Populate step
} : undefined;
```

### 3. Move/Update Default Workflow Steps Sequence
In `src/features/workflows/workflowManager.ts`, update `DEFAULT_WORKFLOW` steps:
- Move `checklist` right after `plan`. Omit `actionOnly: true` (Option B), so it renders as a visual core tab in the Spec Viewer navigation layout.
- Order: `specify` → `clarify` → `plan` → `checklist` → `tasks` → `analyze` → `implement` → `git.validate`.

In `src/core/types/specContext.ts`, align `STEP_NAMES` to match:
```typescript
export const STEP_NAMES: StepName[] = [
    'specify',
    'clarify',
    'plan',
    'checklist',
    'tasks',
    'analyze',
    'implement',
    'git.validate',
];
```

### 4. Feed optional field into SpecViewer scan payload
In `src/features/spec-viewer/documentScanner.ts`, propagate `optional: step.optional` into the returned `SpecDocument`:
```typescript
documents.push({
    type: step.name,
    label,
    fileName,
    filePath,
    exists,
    isCore: true,
    actionOnly: step.actionOnly,
    optional: step.optional, // Expose to frontend
    category: 'core'
});
```

### 5. Render CSS Badge in Webview for Optional Steps
In `webview/src/spec-viewer/components/StepTab.tsx`:
```tsx
const DOC_TO_STEP: Record<string, string> = {
    spec: 'specify',
    clarify: 'clarify',
    plan: 'plan',
    checklist: 'checklist',
    tasks: 'tasks',
    analyze: 'analyze',
    implement: 'implement',
    'git.validate': 'git.validate'
};

// ... inside StepTab:
export function StepTab(props: StepTabProps) {
    // ...
    return (
        <button ...>
            <span class="step-status">{statusIcon}</span>
            <span class="step-label">{doc.label}</span>
            {doc.optional && <span class="optional-badge">optional</span>}
            {vsSubstep && <span class="step-tab__substep">{vsSubstep}</span>}
            {runningStartedAt && <ElapsedTimer />}
            {isStale && <span class="stale-badge">!</span>}
        </button>
    );
}
```

In `webview/styles/spec-viewer/_navigation.css`, append:
```css
/* Optional step badge */
.optional-badge {
    font-size: 9px;
    font-weight: 500;
    text-transform: uppercase;
    padding: 1px 4px;
    border-radius: 4px;
    background: var(--bg-hover);
    color: var(--text-secondary);
    border: 1px solid var(--border);
    margin-left: 2px;
    letter-spacing: 0.3px;
    opacity: 0.8;
}
```

---

## Checklist / Task Plan

### Phase 0: Quick Checks & Setup
* [ ] Verify baseline spec files.
* [ ] Check workspace compilation.

### Phase 1: AI Provider Race Condition Removals
* [ ] Extend `AIOptions` interface in `src/ai-providers/aiProvider.ts` to support `step?: string`.
* [ ] Capture `stepName` on spawn and complete the correct step in `src/ai-providers/acpProvider.ts`.
* [ ] Update `executeWorkflowStep` in `src/features/specs/specCommands.ts` to pass `step` in `aiOptions`.
* [ ] Update `executeStepInTerminal` in `src/features/spec-viewer/messageHandlers.ts` to pass `step` in `aiOptions`.

### Phase 2: Workflow Configuration Realignment
* [ ] Reorder default workflow steps in `src/features/workflows/workflowManager.ts`. Move `checklist` after `plan` (remove `actionOnly` but keep other values). Add optional `clarify` and `analyze` steps.
* [ ] Update canonical `STEP_NAMES` order in `src/core/types/specContext.ts`.

### Phase 3: Visual Elements (Webview Optional Badge)
* [ ] Include `optional` boolean parameter in the `SpecDocument` interface on both extension and webview boundaries.
* [ ] Populate `optional` status in `src/features/spec-viewer/documentScanner.ts`.
* [ ] Add `optional-badge` UI element rendering inside `StepTab.tsx`.
* [ ] Write `optional-badge` stylesheet styling rules in `_navigation.css`.
* [ ] Run `npm run compile` and verify mock test scenarios.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [N/A] | [N/A] | [N/A] |
