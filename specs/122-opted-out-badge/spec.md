# Feature Specification: Opted Out Badge

**Feature Branch**: `122-opted-out-badge`  
**Created**: 2026-06-08  
**Status**: Draft  
**Input**: User description: "Optional icon badge takes too much space in the navigtation banner, instead of adding the icon badge if user didn't run the optional step it show 'opted out' icon or just 'OO' icon badge, if user did run the step opted in, it just should show the normal step presentation without optional icon badge"

## Clarifications

### Session 2026-06-08

- Q: How should the compact unrun indicator be rendered when space is tight? → A: Show either a compact opt-out icon or an `OO` badge, whichever fits best.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compact Unrun State (Priority: P1)

A user opens a spec and sees optional steps marked with a compact opted-out indicator only when those steps have not been run yet, so the navigation stays readable without the larger optional label consuming extra space.

**Why this priority**: The current optional indicator takes too much space, so the first goal is to make unrun optional steps easier to scan in the navigation banner.

**Independent Test**: Open a spec with optional steps that have not been run and confirm each unrun optional step shows the compact opted-out marker instead of the larger optional label.

**Acceptance Scenarios**:

1. **Given** an optional step has not been run, **When** the viewer renders the step navigation, **Then** the step shows a compact opted-out indicator rendered as either a compact icon or an `OO` badge.
2. **Given** a required step, **When** the viewer renders the step navigation, **Then** no opted-out indicator is shown.
3. **Given** multiple optional steps have not been run, **When** the viewer renders the navigation banner, **Then** each unrun optional step uses the same compact indicator treatment.

---

### User Story 2 - Return To Normal Presentation After Run (Priority: P2)

A user runs an optional step and the navigation returns to the normal step presentation with no optional indicator, so completed optional work does not continue to take up space.

**Why this priority**: Once the step has been run, the user no longer needs the compact opted-out marker and should see the standard step presentation.

**Independent Test**: Run any optional step and confirm its tab returns to the normal step presentation without the compact opted-out indicator.

**Acceptance Scenarios**:

1. **Given** an optional step has been run, **When** the viewer updates, **Then** the step displays without the opted-out indicator.
2. **Given** one optional step has been run and another optional step has not, **When** the viewer renders the navigation, **Then** only the unrun optional step shows the compact indicator.
3. **Given** an optional step is run retroactively, **When** the run completes, **Then** the compact indicator disappears from that step.

---

### Edge Cases

- What happens when a spec is opened after optional steps were already skipped or left unrun? The unrun optional steps show the compact indicator immediately.
- What happens when a step changes from unrun to run while the viewer is already open? The indicator disappears from that step without affecting the other steps.
- What happens if the navigation is narrow? The optional-step state remains compact enough to avoid introducing the larger label-based spacing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The viewer MUST show a compact opted-out indicator for every optional step that has not been run.
- **FR-002**: The compact opted-out indicator MAY be rendered as either a compact icon or an `OO` badge, depending on which form best fits the available space.
- **FR-003**: The viewer MUST NOT show the opted-out indicator for optional steps that have been run.
- **FR-004**: The viewer MUST keep required steps visually unchanged by this feature.
- **FR-005**: The compact opted-out indicator MUST be visually smaller than the current optional label presentation.
- **FR-006**: The optional-step presentation MUST be consistent across all optional steps in the workflow.
- **FR-007**: When an optional step transitions from unrun to run, the viewer MUST remove the opted-out indicator from that step.

### Key Entities *(include if data involved)*

- **Optional Step Display State**: The visual state of an optional step in the navigation, including whether it is still unrun or has been run.
- **Step Tab**: The navigation item for a workflow step, which may display the compact opted-out indicator when appropriate.

## Assumptions

- "Opted out" means the optional step has not been run yet or was skipped.
- A compact "OO" marker or equivalent icon is acceptable as long as it is smaller than the current optional label presentation.
- The feature applies to existing optional steps in the standard workflow and any custom workflows that mark steps optional.

## Dependencies

- Viewer navigation rendering for step tabs.
- Existing optional-step state tracking.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify unrun optional steps in the navigation without the indicator taking up the same space as the current label-based presentation.
- **SC-002**: When an optional step is run, its tab returns to the standard appearance with no optional indicator in 100% of updated states.
- **SC-003**: In validation of the default viewer layout, the navigation row remains visually compact and readable when multiple optional steps are present.
- **SC-004**: Users can distinguish unrun optional steps from run optional steps without opening the step itself.
