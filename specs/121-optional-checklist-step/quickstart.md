# Quickstart: Testing Optional Workflow Steps & Lifecycle Fixes

Follow these guidelines to test and verify the updated Speckit optional step workflow structure and race-condition repairs.

---

## 1. Setup & Environment

Ensure you are working in the correct branch:
```bash
git checkout 121-optional-checklist-step
```

Compile the extension and start watch mode:
```bash
npm run compile
# or
npm run watch
```

Press `F5` in VS Code to launch the Extension Development Host.

---

## 2. Walkthrough Validation

### Test Case A: Step Ordering & Webview UI Optional Badges
1. Inside the Extension Development Host, open any Speckit specification using the Spec Viewer.
2. Confirm the sequence of tabs displayed at the top matches:
   **Specification** → **Clarify** (with `optional` label) → **Plan** → **Checklist** (with `optional` label) → **Tasks** → **Analyze** (with `optional` label) → **Implement**
3. Verify that the **Checklist** tab is visible and displays its contents dynamically if you have any lists generated under the `checklists/` directory.

### Test Case B: Skip-Plan Bug Resolution (Race Condition)
1. Complete the `specification` step so you are on the `clarify` step.
2. Click the **Clarify** tab/button to run `/speckit.clarify`.
3. While the `/speckit.clarify` execution is in-progress (active terminal state), click **Approve** (labeled **Plan** in the footer) to transition to the implementation plan step.
4. Verify:
   * The active step shifts to **Plan**.
   * It starts spawning `/speckit.plan`.
   * It **does not** skip Plan! The Plan step executes correctly, and does not automatically complete and jump to Tasks.
   * Check the `.spec-context.json` log and ensure both `clarify` and `plan` have correct start/completion events without overlap or clobbering.
