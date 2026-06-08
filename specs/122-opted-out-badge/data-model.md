# Data Model: Opted Out Badge

## Entities

### WorkflowStepConfig

- Represents one step in the workflow definition.
- Relevant fields: `name`, `label`, `command`, `file`, `optional`, `actionOnly`, `subFiles`, `subDir`, `includeRelatedDocs`, `agent`, `model`, `continue`.
- For this feature, `optional` determines whether the step can surface the compact opted-out display state when it has not been run.

### SpecDocument

- Represents a document shown in the Spec Viewer navigation.
- Relevant fields: `type`, `label`, `fileName`, `filePath`, `exists`, `isCore`, `actionOnly`, `optional`, `category`, `parentStep`.
- For this feature, `optional` is forwarded from the workflow step so the renderer can decide whether to show the compact badge.

### Step Tab

- Represents a single navigation entry for a workflow step.
- Derived state used by the renderer: `isOptional`, `isRunState`, and the compact opted-out presentation.
- The step tab should render either the normal tab presentation or the compact opted-out marker, but not both at once.

## Relationships

- `WorkflowStepConfig.optional` drives `SpecDocument.optional`.
- `SpecDocument.optional` drives the `StepTab` compact badge rendering.
- When a step transitions from unrun to run, the `StepTab` state must drop the compact badge and show the normal step presentation.

## Validation Rules

- Optional steps must retain their existing workflow ordering and output-file behavior.
- Required steps must not gain the compact opted-out marker.
- The badge presentation must be consistent across all optional steps.
- The run-state transition must remove the compact badge immediately when the viewer refreshes.