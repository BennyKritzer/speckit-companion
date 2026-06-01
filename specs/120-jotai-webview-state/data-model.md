# Data Model: Jotai Webview State Management

## Overview

The feature centers on a browser-side viewer state model that is hydrated from extension snapshots and then projected into the spec-viewer UI through Jotai atoms and derived selectors.

## Entities

### Extension Snapshot

Represents the latest authoritative data sent from the extension to the webview.

**Key fields**:
- `specContext` - the current workflow/spec context from the extension
- `navState` - navigation and footer-related state for the viewer
- `viewerState` - derived workflow state such as badges, footer actions, and step history
- `documentContent` - rendered markdown or HTML content for the active document
- `activeDocument` - the current document or tab being viewed

**Relationships**:
- Drives the base Jotai atoms.
- Replaces prior snapshot values when a newer message arrives.

### Shared Webview State

Represents the in-memory viewer state that multiple webview components read from.

**Key fields**:
- `activeSpec` - the current spec context selected in the viewer
- `specContent` - the active document content displayed in the main pane
- `navigation` - tab/document selection and related visible navigation state
- `uiState` - local viewer flags such as loading, visibility, and transient interaction state

**Relationships**:
- Is hydrated from Extension Snapshot data.
- Serves as the source for derived viewer state.
- Is read by multiple components including the app shell, footer, timer, and navigation-related UI.

### Derived Viewer State

Represents values computed from the shared state rather than stored independently.

**Key fields**:
- `badgeState` - the current visual badge and lifecycle cues
- `footerState` - the visible footer mode and actions
- `stepTiming` - elapsed or running-time information
- `navigationHighlights` - which sections or steps should appear active/completed

**Relationships**:
- Derived from Shared Webview State and Extension Snapshot inputs.
- Must remain internally consistent across all subscribed components.

### Active Spec Context

Represents the currently open spec directory and its workflow context.

**Key fields**:
- `specName`
- `branch`
- `currentStep`
- `status`
- `history`

**Relationships**:
- Stored in the extension and mirrored into the webview.
- Used to repopulate the store after reload or reconnection.

## Validation Rules

- The webview must not invent a newer snapshot than the extension has sent.
- Derived state must always be computed from the latest base snapshot values.
- Reloading the webview must not require the user to manually reconstruct state.
- Shared state must remain scoped to the spec-viewer UI and not leak into unrelated webviews.

## State Flow

1. The extension reads or updates workspace-backed state.
2. The extension sends a snapshot message to the webview.
3. The webview message listener updates the base atoms.
4. Derived atoms recompute the visible UI state.
5. Components re-render based on the atoms they subscribe to.
