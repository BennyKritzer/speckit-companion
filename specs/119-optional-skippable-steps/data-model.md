# Data Model: Optional Skippable Steps

## 1. Schema Extensions

### `.spec-context.json` Schema
- The `history` array objects will have the `kind` enum expanded:
  `{ "enum": ["start", "complete", "skip"] }`

### `WorkflowStepConfig` (TypeScript)
- Modified to include a new boolean field:
  ```typescript
  export interface WorkflowStepConfig {
      name: string;
      label?: string;
      optional?: boolean; // NEW: Indicates the step can be bypassed
      // ...
  }
  ```

## 2. In-Memory View Models

### `ViewerState` (Webview / Extension payload)
- `stepHistory` objects (`StepHistoryEntry`) need a way to indicate skip. 
  ```typescript
  export interface StepHistoryEntry {
      startedAt?: string;
      completedAt?: string | null;
      skippedAt?: string | null; // NEW: Tracks when a skip occurred
      // ...
  }
  ```
- `footer` serialization (`SerializedFooterAction`) will receive a "SKIP" action when applicable.
