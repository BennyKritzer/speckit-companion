# Interface Contracts: Webview & Extension Coordination

---

## 1. Extension-to-Webview state delivery (`updateContent`)

When the webview is opened or refreshed, the extension scans the active specification directory, derives the state, and sends down a configuration payload containing available pages/tabs and current badges.

The `documents` list contains optional indicators:

```json
{
  "type": "updateContent",
  "state": {
    "specName": "Optional Checklist Step After Plan",
    "currentDocument": "plan",
    "availableDocuments": [
      {
        "type": "specify",
        "label": "Specification",
        "fileName": "spec.md",
        "filePath": "/absolute/path/specs/feature/spec.md",
        "exists": true,
        "isCore": true,
        "category": "core",
        "optional": false
      },
      {
        "type": "clarify",
        "label": "Clarify",
        "fileName": "clarify.md",
        "filePath": "/absolute/path/specs/feature/clarify.md",
        "exists": false,
        "isCore": true,
        "actionOnly": true,
        "category": "core",
        "optional": true
      },
      {
        "type": "plan",
        "label": "Plan",
        "fileName": "plan.md",
        "filePath": "/absolute/path/specs/feature/plan.md",
        "exists": true,
        "isCore": true,
        "category": "core",
        "optional": false
      },
      {
        "type": "checklist",
        "label": "Checklist",
        "fileName": "checklists/requirements.md",
        "filePath": "/absolute/path/specs/feature/checklists/requirements.md",
        "exists": false,
        "isCore": true,
        "category": "core",
        "optional": true
      }
    ]
  }
}
```

---

## 2. In-flight step target tracking (`executeInTerminal`)

When executing commands, the step name is passed along to the provider asynchronously through `AIOptions`:

```typescript
// Contract for provider dispatch options
export interface AIOptions {
    model?: string;
    agent?: string;
    continue?: boolean;
    specDir?: string;
    step?: string; // Captured step (e.g., 'clarify', 'plan') to run completion on
}
```
This guarantees that when the terminal outputs completion signals, the extension marks the exact step starting execution, preventing transitions from clobbering other in-flight steps.
