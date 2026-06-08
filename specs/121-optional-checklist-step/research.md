# Research Findings: Optional Clarify, Checklist, and Analyze Steps

---

## 1. Finding & Root Cause of the Skip-Plan Bug

When using the `speckit.clarify` command, pressing the "Approve" (labeled "Plan") button activates the `handleApprove` message handler in the Spec Viewer extension. 

### Root Cause
1. `handleApprove` synchronous logic sets `currentStep` on disk to `"plan"` by firing `startStep(..., 'plan', 'extension')`.
2. This immediately updates the step in `.spec-context.json` to `"plan"`.
3. At the same time, the `speckit.clarify` terminal execution finishes, triggering the ACP provider's asynchronous `onCompletion()` hook.
4. Inside `onCompletion()`, the provider read the `.spec-context.json` state dynamically from disk *at completion time* to find what step completed:
   ```ts
   const ctx = readSpecContextSync(capturedSpecDir);
   if (ctx && ctx.currentStep) {
       await completeStep(capturedSpecDir, ctx.currentStep as StepName, 'ai');
   }
   ```
5. Since the state on disk had already transitioned to `"plan"`, `onCompletion()` read `"plan"` as the current step and fired `completeStep(..., 'plan', 'ai')`. 
6. This immediately marked the `plan` step as `completed` without actually running it, causing the viewer to advance straight to `tasks`.

---

## 2. Options and Decisions

### Decision 1: Resolving the Race Condition (Skip-Plan Bug)
*   **Decision:** Capture the step name synchronously at startup in the AI Provider's `executeInTerminal`, and supply it as part of `AIOptions` so `onCompletion` always targeted the specific step it was spawned for.
*   **Alternatives Considered:**
    1.  *Await terminal exit in handleApprove*: Keep `handleApprove` blocked until the previous terminal has terminated. Rejected because terminal termination is often delayed, causing bad UI lock periods.
    2.  *Refuse completion on transition*: Do not auto-complete via `onCompletion` for certain steps. Rejected because ACP depends on `onCompletion` to transition appropriately when commands report success.

### Decision 2: Checklist Document Visibility (Option B)
*   **Decision:** Remove `actionOnly: true` from the `checklist` step configuration. 
*   **Rationale:** Removing `actionOnly: true` means the `checklist` step gets its own core document tab in the Spec Viewer showing generated lists from `checklists/requirements.md` (or the `checklists/` subdirectory). It empowers the user to interact with checklist markdown documents as native citizens of the speckit document workspace.

### Decision 3: Visualization of Optional Steps (Option B)
*   **Decision:** Add an `.optional-badge` indicator CSS class in `_navigation.css`, and render an `<span class="optional-badge">optional</span>` label in the `StepTab` component when `doc.optional` is true.
*   **Alternatives Considered:**
    *   *Muted tab labels*: Muting the whole tab. Rejected because it looks disabled or locked, which harms readability and discoverability.

---

## 3. Best Practices & Reference Implementation

*   **Step Parameter Preservation**: Add `step?: string` attribute to `AIOptions` in `src/ai-providers/aiProvider.ts`.
*   **In-Memory Context Preservation**:
    *   In `src/features/specs/specCommands.ts`, append `step: stepConfig.name` to `aiOptions`.
    *   In `src/features/spec-viewer/messageHandlers.ts` `executeStepInTerminal`, append `step: step.name`.
    *   In `src/ai-providers/acpProvider.ts`, capture the step name synchronously at spawn:
        ```ts
        const stepName = options?.step || readSpecContextSync(capturedSpecDir)?.currentStep || 'specify';
        ```
    *   Use `stepName` inside `onCompletion` to complete the specific step.
