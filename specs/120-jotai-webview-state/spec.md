# Feature Specification: Jotai Webview State Management

**Feature Branch**: `120-jotai-webview-state`
**Created**: 2026-06-01
**Status**: Draft
**Input**: User description: "I want to implement a new feature: Add Jotai for Webview State Management. The goal is to introduce `jotai` into the Webview side of the SpecKit Companion extension to provide a unified, reactive, and centralized state management system. This will replace the current fragmented approach where state is scattered across various components using local `useState` hooks."

## Clarifications

### Session 2026-06-01

- Q: Should Jotai be scoped only to the spec-viewer webview for this feature, or should it be introduced across all webview surfaces now? → A: Scope Jotai to the spec-viewer webview only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Shared viewer state stays consistent (Priority: P1)

As a user, I want the webview to keep the active spec, navigation, footer, and derived workflow status in sync from a shared state model, so I never see conflicting information in different parts of the viewer.

**Why this priority**: Without a shared state model, the viewer continues to drift across components and the rest of the feature cannot behave reliably.

**Independent Test**: Open a spec, trigger a workflow update, and verify that the footer, navigation, badges, and content all reflect the same state without a manual refresh.

**Acceptance Scenarios**:

1. **Given** the viewer is open, **When** a new spec snapshot is received, **Then** the active spec and derived UI state update together across all subscribed regions.
2. **Given** shared state changes in one viewer region, **When** another subscribed region renders, **Then** it shows the same active status without mismatch.

---

### User Story 2 - Extension-driven updates propagate through one bridge (Priority: P2)

As a user, I want changes from the extension side to update the webview automatically, so edits and workflow transitions appear without manual syncing.

**Why this priority**: The webview is only useful if it reflects the extension's authoritative file-based state in real time.

**Independent Test**: Modify the underlying spec or advance the workflow, then confirm the webview updates from the incoming extension message without reloading the panel.

**Acceptance Scenarios**:

1. **Given** the extension sends a new snapshot, **When** the webview receives it, **Then** the current shared state is replaced with the latest values.
2. **Given** multiple updates arrive close together, **When** the webview settles, **Then** the final visible state matches the most recent snapshot.

---

### User Story 3 - Derived viewer state remains trustworthy (Priority: P3)

As a user, I want badges, footer visibility, timing/status cues, and other derived UI elements to stay correct as workflow state changes, so the interface remains trustworthy during spec creation and implementation.

**Why this priority**: Derived state is where inconsistencies become visible and confusing.

**Independent Test**: Advance through several workflow states and verify the derived UI remains aligned with the underlying spec context.

**Acceptance Scenarios**:

1. **Given** the workflow changes status, **When** the viewer rerenders, **Then** the derived badge, footer, and navigation indicators update together.
2. **Given** the webview reloads, **When** the extension resends the latest snapshot, **Then** the derived state is reconstructed correctly.

---

### Edge Cases

- The webview opens before the first snapshot arrives from the extension.
- The active spec is deleted or becomes unavailable while the panel is open.
- Multiple extension messages arrive in quick succession.
- The panel is reloaded after the viewer has already diverged from the file system.
- A component subscribes to derived state before the base snapshot exists.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The spec-viewer webview MUST use a shared reactive state model for viewer data so multiple components can read consistent values without prop drilling.
- **FR-002**: The shared state model MUST represent the active spec, the current spec content, UI state, navigation state, and derived viewer state needed by the spec viewer.
- **FR-003**: The main spec-viewer webview entry point MUST provide the shared state model to the viewer subtree so all subscribed components can react to the same source of truth.
- **FR-004**: The extension MUST remain the authoritative source of truth for persisted workflow and file state, and the webview MUST update from extension snapshots rather than owning persistence.
- **FR-005**: Shared viewer components MUST consume the shared state model directly instead of relying on deep prop chains for state that is used in more than one place.
- **FR-006**: Derived viewer outputs such as badges, footer visibility, and workflow indicators MUST be computed from the base shared state so they always reflect the same underlying snapshot.
- **FR-007**: When the webview receives a new extension snapshot, the visible viewer state MUST update coherently across all subscribed regions without requiring a full manual refresh.
- **FR-008**: Reloading or reopening the viewer MUST allow the latest extension snapshot to repopulate the shared state so the user sees the most recent spec context.
- **FR-009**: This feature MUST NOT change the extension's existing manager-based architecture or move file persistence into the webview runtime, and it MUST remain scoped to the spec-viewer webview.

### Key Entities *(include if feature involves data)*

- **Shared Webview State**: The reactive viewer state used by the webview to keep multiple components aligned on the same active spec and UI context.
- **Extension Snapshot**: The latest authoritative update emitted by the extension for the current spec or workflow state.
- **Derived Viewer State**: Computed values such as badges, footer visibility, and workflow indicators that are calculated from the shared state.
- **Active Spec Context**: The current spec selection and related viewer context shown in the webview.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual testing, updates from the extension appear consistently across all subscribed viewer regions within 1 second in at least 95% of attempts.
- **SC-002**: In 100% of reload tests, reopening the viewer restores the latest active spec and workflow context after the extension resends its snapshot.
- **SC-003**: Across 20 consecutive workflow transitions, no visible mismatch appears between the footer, navigation, and status indicators.
- **SC-004**: Users can continue normal spec-viewing workflows without any manual sync action or full panel refresh in a representative end-to-end test.

## Assumptions

- Jotai is used only inside the webview runtime and is not persisted across application restarts.
- The extension continues to own file-backed state and workflow authority.
- Existing viewer status rules remain the source for derived UI logic, with only the consumption model changing.
