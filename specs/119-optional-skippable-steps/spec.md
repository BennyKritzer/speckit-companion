# Feature Specification: Optional Skippable Steps

**Feature Branch**: `119-optional-skippable-steps`  
**Created**: May 31, 2026  
**Status**: Draft  
**Input**: User description: "I want to add to steps attribute of optional/skippable that will let the user to skip over steps, specifically for SpecKit workflow it will be Clarify, Analyze, Checklist and git.validate. And new button in the footer will appear for those steps marked as skippable or optional - Skip, this will set the step to a new state of Skipped and show in the navbar that it was skipped, once skipped the button for the next step will show."

## Clarifications

### Session 2026-05-31

- Q: How is a "Skipped" state handled during calculation of the total `taskCompletionPercent`? -> A: A skipped step contributes neither to the completed task count nor to the total task count.
- Q: How does the activity timeline display a skipped step? -> A: Show a greyed-out entry with a specific "Skipped" annotation instead of duration.
- Q: What happens if a step is skipped but later the user returns intending to execute it? -> A: They can change their mind as long as they didn't run the next step.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Skip Optional Steps via Footer (Priority: P1)

As a user, I want the ability to skip optional steps (like Clarify or Checklist) by clicking a "Skip" button the footer, so I can advance the workflow without executing unnecessary work.

**Why this priority**: Skipping defined roadblocks is the primary mechanism to make flexible workflows useful. If users cannot skip them, the workflow effectively mandates them.

**Independent Test**: Can be fully tested by opening a step configured as optional (e.g. Clarify), clicking the "Skip" button in the footer, and verifying that the system advances to the next step.

**Acceptance Scenarios**:

1. **Given** a user is viewing a step that is configured as optional, **When** they look at the footer, **Then** a "Skip" button should be visible alongside the other lifecycle actions.
2. **Given** a user clicks "Skip" on an optional step, **Then** the step state transitions to "Skipped" and the button to proceed to the next step becomes available.

---

### User Story 2 - Skipped Status Reflected in Navbar (Priority: P2)

As a user, I want to clearly see in the navigation bar when a step has been skipped, so I understand the historical progression of the work without confusion over missing artifacts.

**Why this priority**: Ensures visual integrity and context persistence. Without UI acknowledgement that a step was skipped, it might wrongly appear as pending or buggy.

**Independent Test**: Can be tested independently by having a skipped step in the workflow state and verifying its presentation in the main navigation tab differs appropriately from active or done steps.

**Acceptance Scenarios**:

1. **Given** an optional step that has been skipped, **When** the navigation bar is rendered, **Then** the skipped step should clearly display a "skipped" visualization (e.g., specific iconography, strikethrough, or muted state).

---

### Edge Cases

- What happens if the user attempts to skip a mandatory (non-optional) step? (Skip button should never render).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support an `optional` or `skippable` boolean attribute on workflow step configurations (e.g. `WorkflowSteps` metadata).
- **FR-002**: System MUST configure Clarify, Analyze, Checklist, and Git Validate as optional steps by default in the SpecKit workflow.
- **FR-003**: System MUST conditionally render a "Skip" button in the footer actions when the active step has the `optional` attribute set to true.
- **FR-004**: Clicking "Skip" MUST record the transition in the workflow history indicating the step was intentionally skipped.
- **FR-005**: A skipped step MUST grant unblocked access to the successive step in the sequence, functionally equivalent to passing the step.
- **FR-006**: The navigation bar (StepTab) MUST visually differentiate skipped steps.
- **FR-007**: A skipped step MUST NOT block the overall "completed" calculation for progress.

### Key Entities

- **WorkflowStepConfig**: Extended to support the optional/skippable boolean flag.
- **HistoryEntry**: Must be capable of logging a "skip" action to communicate to the frontend UI that the step skipped execution.
- **SpecContext / ViewerState**: Must interpret the newly introduced Skipped states to distribute them to the Navigation Bar and Phased Timeline components.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can skip all 4 newly optional steps (Clarify, Analyze, Checklist, Git Validate) cleanly from the UI and reach completion.
- **SC-002**: Verification that a user manually skipping an optional phase saves time (measured task advancement bypass) compared to generating/dismissing it.
- **SC-003**: No regressions on mandatory steps preventing skipping securely.
