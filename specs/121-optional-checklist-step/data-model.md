# Data Model Updates: Optional Steps & ACP Lifecycle Context

---

## 1. Updated Interfaces

### `AIOptions` in `src/ai-providers/aiProvider.ts`
We add `step` to capture the step name under execution, preventing execution asynchronous completion race conditions.

```typescript
export interface AIOptions {
    model?: string;
    agent?: string;
    continue?: boolean;
    autoExecute?: boolean;
    specDir?: string;
    step?: string; // Captures the exact workflow step under execution
}
```

### `SpecDocument` in `src/features/spec-viewer/types.ts` & `webview/src/spec-viewer/types.ts`
We add `optional` so the webview can parse whether a document step is optional and render visual badges.

```typescript
export interface SpecDocument {
    type: DocumentType;
    label: string;
    fileName: string;
    filePath: string;
    exists: boolean;
    isCore: boolean;
    actionOnly?: boolean;
    optional?: boolean; // Captures whether this step is optional
    category: DocumentCategory;
    parentStep?: string;
}
```

---

## 2. Default Workflow Schema Update

The `DEFAULT_WORKFLOW` steps will be reorganized in order:
1. `specify` (required, file: `spec.md`)
2. `clarify` (optional, actionOnly: true)
3. `plan` (required, file: `plan.md`)
4. `checklist` (optional, file: `checklists/requirements.md`, subDir: `checklists`, includeRelatedDocs: true)
5. `tasks` (required, file: `tasks.md`)
6. `analyze` (optional, actionOnly: true)
7. `implement` (required, actionOnly: true)
8. `git.validate` (optional, actionOnly: true)

And `STEP_NAMES` ordering in `src/core/types/specContext.ts` will match this sequence:
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
This keeps workflow indices and step skipping logic consistent across the entire backend/frontend.
