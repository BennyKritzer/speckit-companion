# Feature Specification: Footer Action Consolidation

**Feature Branch**: `123-footer-action-consolidation`  
**Created**: 2026-06-08  
**Status**: Draft  
**Input**: User description: "All buttons and actions should be consolidated into the footer, there shouldn't be a double logic and double buttons in the navigation bar and the footer bar. The only exception is to leave the activity view toggle in the navigation bar."

## Clarifications

### Session 2026-06-08

- Q: Should consolidation move every interactive viewer control in the header/footer chrome into the footer, with the activity view toggle as the only navigation-bar exception? → A: Yes, move every interactive viewer control into the footer except the activity view toggle.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Footer becomes the single action area (Priority: P1)
A user opens the spec viewer and sees all interactive controls in the footer, with only the activity view toggle remaining in the navigation bar.

**Why this priority**: This is the core user-facing change. Without it, the interface still communicates two competing places to look for actions.

**Independent Test**: Open the viewer in each supported state and confirm that every action control is reachable in the footer, while the activity view toggle remains in the navigation bar.

**Acceptance Scenarios**:

1. **Given** the viewer shows any action buttons, **When** the user opens the page, **Then** the navigation bar contains only the activity view toggle and the footer contains the action buttons.
2. **Given** the viewer state changes, **When** a different action becomes available, **Then** it appears in the footer and does not reintroduce a duplicate in the navigation bar.

---

### User Story 2 - No duplicate controls across chrome (Priority: P2)
A user never sees the same action presented twice in different parts of the chrome, so there is one clear place to interact with the viewer.

**Why this priority**: Duplicate controls create confusion and make the interface feel inconsistent even if the underlying behavior still works.

**Independent Test**: Move through the major viewer states and verify that each action appears in only one place at a time.

**Acceptance Scenarios**:

1. **Given** an action is available in the footer, **When** the user checks the navigation bar, **Then** the same action is not also shown there.
2. **Given** the activity view toggle is present, **When** the user checks the footer, **Then** that toggle is not duplicated in the footer.

---

### User Story 3 - Footer stays usable in constrained layouts (Priority: P3)
A user resizes the viewer panel and still has access to the consolidated footer controls without overlap or loss of meaning.

**Why this priority**: Consolidating controls into one area only works if that area remains readable and usable at smaller widths.

**Independent Test**: Narrow the panel to a small width and verify the footer controls remain accessible and the activity view toggle stays in the navigation bar.

**Acceptance Scenarios**:

1. **Given** the panel is narrow, **When** the footer renders multiple controls, **Then** they remain distinct and usable without overlapping.
2. **Given** the panel is narrow, **When** the user needs the activity view toggle, **Then** it remains available in the navigation bar.

### Edge Cases

- A viewer state exposes only one action; the footer still owns that action and the navigation bar still avoids duplicate action buttons.
- A viewer state exposes several actions at once; the footer may wrap or group them, but the navigation bar still shows only the activity view toggle.
- The panel becomes very narrow; controls should compress or wrap before they overlap or become impossible to activate.
- A future viewer state adds another action control; the same placement rule applies automatically, with the activity view toggle still exempt.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The spec viewer MUST render every interactive viewer control in the footer bar, except for the activity view toggle, which MUST remain in the navigation bar.
- **FR-002**: The spec viewer MUST keep the activity view toggle in the navigation bar.
- **FR-003**: The spec viewer MUST NOT show any interactive control in both the navigation bar and the footer bar at the same time.
- **FR-004**: Moving a control into the footer MUST NOT change the control's meaning, label, or behavior.
- **FR-005**: The consolidation rule MUST apply consistently across all supported viewer states that expose interactive controls in the viewer chrome.
- **FR-006**: Non-action informational elements in the navigation bar MUST remain unchanged unless they are part of the duplicated action set.
- **FR-007**: The footer layout MUST keep the consolidated controls readable and usable in narrow panels without overlap that blocks interaction.

### Key Entities

- **Action control**: Any button-like viewer affordance that triggers an action for the current spec or viewer state.
- **Navigation bar**: The upper viewer chrome area where controls are currently displayed.
- **Footer bar**: The lower viewer chrome area where the action controls will be consolidated.
- **Activity view toggle**: The only control that remains in the navigation bar after consolidation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of supported viewer states, the navigation bar contains no interactive controls other than the activity view toggle.
- **SC-002**: In 100% of supported viewer states, each action control is available in exactly one location.
- **SC-003**: In 100% of narrow-panel checks, the footer controls remain distinguishable and usable without overlap that prevents activation.
- **SC-004**: In a review of at least 10 participants or test passes, 90% or more correctly identify the footer as the place to find viewer actions after a single glance.

## Assumptions

- The feature changes placement and duplication only; it does not change labels, icons, or action behavior.
- The activity view toggle is the sole navigation-bar exception and remains there in every supported viewer state.
- Non-action informational content in the navigation bar can remain where it is.
- The viewer already has a concept of a footer area that can host the consolidated controls.