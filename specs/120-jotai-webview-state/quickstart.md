# Quickstart: Jotai Webview State Management

## Prerequisites

- Node.js and npm installed
- The repository dependencies installed with `npm install`
- VS Code available for running the extension development host

## Setup

1. Install dependencies if needed: `npm install`.
2. Open the workspace in VS Code.
3. Select the `120-jotai-webview-state` branch.
4. Launch the extension development host.

## Verification Flow

1. Open a spec that renders the spec-viewer webview.
2. Trigger a workflow update or switch documents so the extension sends a fresh snapshot.
3. Confirm the webview updates the active spec, navigation, footer, and derived indicators without manual refresh.
4. Reload the webview and confirm the latest snapshot repopulates the atom-backed shared state automatically.
5. Verify the spec-viewer remains the only surface using the new Jotai store.

## Developer Checks

- If the webview state looks stale, confirm the extension message bridge is still sending the latest snapshot before debugging the atoms.
- If a component shows inconsistent state, check whether it should subscribe to a shared atom or remain local.
- If you add a new shared viewer field, update the base snapshot and derived atoms together so the UI stays coherent.
