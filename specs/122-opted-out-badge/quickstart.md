# Quickstart

## Validate the Plan

```bash
npm run compile
npm test
```

## Manual Verification

1. Open a spec that includes optional workflow steps.
2. Confirm an unrun optional step shows the compact opted-out marker instead of the wider optional label.
3. Run the optional step.
4. Confirm the tab returns to the normal step presentation with no opted-out marker.
5. Repeat the check for another optional step to confirm the presentation is consistent across the workflow.

## Storybook Smoke Check

1. Open the `Viewer/StepTab` stories in Storybook.
2. Confirm `OptionalUnrun` shows the compact `OO` badge.
3. Confirm `OptionalComparison`, `OptionalRunning`, and `OptionalSkipped` do not show the badge.
4. Open `Viewer/NavigationBar` and verify the compact optional treatment still fits the navigation row at a narrow width.

## Expected Outcome

- Unrun optional steps are easy to spot without taking extra banner width.
- Run optional steps look like normal step tabs.
- Required steps remain visually unchanged.