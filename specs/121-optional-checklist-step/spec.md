# Feature Specification: Optional Clarify, Checklist, and Analyze Steps in Speckit Workflow

**Feature Branch**: `121-optional-checklist-step`  
**Created**: 2026-06-07  
**Status**: Draft  
**Input**: User description: "Update the optional step of checklist in speckit default workflow to be after the plan step. Add clarify as an optional step after specify, and analyze as an optional step after tasks."

## Clarifications

### Session 2026-06-07

- Q: How should optional steps be declared in the workflow schema? → A: Use the extension's existing `optional` field support — no schema changes needed.
- Q: How should optional steps be visually distinguished in the viewer? → A: Small "optional" text label or icon badge next to the step name (Option B).
- Q: Where is the workflow step ordering update implemented? → A: In the extension code (workflow provider), not in workflow.yml.
- Q: Should all three optional steps support retroactive generation? → A: Yes — clarify, checklist, and analyze all support retroactive generation (Option A).
- Q: Which implementation areas are in scope? → A: All three — workflow provider (step ordering), viewer rendering (optional badge), and step navigation (skip/retroactive logic) (Option A).
- Q: Visibility of the Checklist Step's Generated Documents in the Spec Viewer? → A: Option B. Remove `actionOnly: true` from the `checklist` step configuration so it gets its own document tab in the Spec Viewer showing generated lists from `checklists/`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run speckit workflow with optional steps in correct positions (Priority: P1)

A user runs the standard speckit workflow and gets three optional steps at their most useful positions: clarify after specify, checklist after plan, and analyze after tasks. This lets them validate each artifact before proceeding to the next phase.

**Why this priority**: These optional steps provide quality gates at critical decision points — clarifying ambiguities early, validating design before task decomposition, and reviewing implementation readiness before execution.

**Independent Test**: Can be verified by running `speckit.specify` then confirming the viewer shows a clarify button; running `speckit.plan` then confirming a checklist button appears; running `speckit.tasks` then confirming an analyze button appears.

**Acceptance Scenarios**:

1. **Given** a spec is in "specifying" status with spec.md present, **When** the user clicks the clarify step button, **Then** clarification questions are generated and presented for the user to answer
2. **Given** a spec is in "planned" status with plan.md present, **When** the user clicks the checklist step button, **Then** a checklist file is generated at `checklists/requirements.md`
3. **Given** a spec is in "ready-to-implement" status with tasks.md present, **When** the user clicks the analyze step button, **Then** a cross-artifact consistency analysis is performed and results are presented

---

### User Story 2 - View updated workflow step order (Priority: P1)

A user opens a spec in the viewer and sees the speckit default workflow steps in their new order: specify → review-spec → clarify → plan → checklist → review-plan → tasks → analyze → implement.

**Why this priority**: Users need to see the correct step order to understand where they are in the process and what comes next.

**Independent Test**: Can be verified by opening any speckit spec in the viewer and confirming the step tabs/buttons show the correct order with all three optional steps (clarify, checklist, analyze) between their respective required steps.

**Acceptance Scenarios**:

1. **Given** a spec uses the "speckit" workflow, **When** the viewer renders the step navigation, **Then** steps appear in order: specify, review-spec, clarify, plan, checklist, review-plan, tasks, analyze, implement
2. **Given** any of the three optional steps (clarify, checklist, analyze), **When** viewing the step list, **Then** each displays with an optional indicator (e.g., a small icon or label)

---

### User Story 3 - Skip all optional steps and run the workflow (Priority: P2)

A user who trusts their process wants to skip all optional steps and go directly from specify through implement without any quality gates.

**Why this priority**: Optional steps should be skippable without breaking the workflow for users who prefer speed over validation.

**Independent Test**: Can be verified by clicking past all optional steps in the viewer and confirming the workflow advances correctly through all required steps to completion.

**Acceptance Scenarios**:

1. **Given** the user is at any optional step, **When** they skip it, **Then** the workflow advances to the next required step
2. **Given** any optional steps were skipped, **When** the user later wants to use them, **Then** they can click each optional button to retroactively generate its artifact

---

### Edge Cases

- What happens when a user has an existing speckit spec that was created before this change? → The workflow configuration is read at runtime; existing specs continue to work with the new step order.
- How does the viewer distinguish optional from required steps visually? → Optional steps display a distinct visual indicator (e.g., a small "optional" badge or muted styling).
- What happens if a user runs an optional step out of order (e.g., checklist before plan)? → The viewer should disable or hide optional steps that don't have their prerequisite artifacts present.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension's workflow provider MUST inject the clarify step between review-spec and plan as an optional step at runtime
- **FR-002**: The extension's workflow provider MUST inject the checklist step between plan and review-plan as an optional step at runtime. It MUST NOT set `actionOnly: true` for the checklist step configuration, so that it receives its own tab in the Spec Viewer showing generated lists from `checklists/`.
- **FR-003**: The extension's workflow provider MUST inject the analyze step between tasks and implement as an optional step at runtime
- **FR-004**: Each optional step (clarify, checklist, analyze) MUST use the extension's existing `optional` field support
- **FR-005**: The viewer MUST render all optional steps with a small "optional" text label or icon badge next to the step name
- **FR-006**: Users MUST be able to skip any optional step without blocking workflow advancement
- **FR-007**: Users MUST be able to retroactively generate artifacts for all three skipped optional steps (clarify, checklist, analyze) by clicking the respective button
- **FR-008**: The extension's workflow provider MUST support all three areas: step ordering injection, viewer rendering with optional badges, and step navigation with skip/retroactive logic

### Key Entities *(include if feature involves data)*

- **Workflow Step**: A phase in the speckit lifecycle with properties: id, label, type (command/gate/optional), optional flag, and position in the sequence
- **Checklist File**: Generated markdown file at `checklists/requirements.md` containing validation items for the spec quality

## Assumptions

- The checklist, clarify, and analyze generation commands (`speckit.checklist`, `speckit.clarify`, `speckit.analyze`) already exist and work correctly
- The extension's workflow provider already has infrastructure for injecting optional steps at runtime
- Existing specs will adopt the new step order automatically since the workflow provider handles ordering in code
- The viewer already supports rendering optional steps; it just needs the badge/icon component

## Dependencies

- `src/features/workflows/workflowProvider.ts` (or similar) — extension code that injects optional steps into the display order
- `webview/src/spec-viewer/components/` — viewer components that render step navigation and badges
- `speckit.clarify`, `speckit.checklist`, `speckit.analyze` commands — existing CLI commands for generating artifacts
