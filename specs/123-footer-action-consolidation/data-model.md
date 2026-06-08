# Data Model: Footer Action Consolidation

This feature does not add new persisted storage, but it does tighten the derived UI model that decides where interactive controls appear.

## Entities

### ViewerChromeState

Represents the derived chrome for the spec viewer.

Fields:
- `navActions`: interactive controls shown in the navigation bar.
- `footerActions`: interactive controls shown in the footer.
- `activityToggleVisible`: whether the activity view toggle is available.
- `activityToggleEnabled`: whether the activity toggle is currently interactive.

Relationships:
- `navActions` may contain the activity view toggle and non-interactive labels, but no duplicate action buttons.
- `footerActions` contains every interactive viewer control except the activity view toggle.

### FooterAction

Represents one clickable action in the footer.

Fields:
- `id`: stable action identifier.
- `label`: visible button text.
- `tooltip`: help text shown on hover.
- `scope`: `spec` or `step`.
- `variant`: visual emphasis used by the footer button component.

Relationships:
- `FooterAction` instances are derived from existing viewer state and the footer action catalog.
- The same action must not be rendered in both the navigation bar and the footer.

### ActivityViewToggle

Represents the single navigation-bar exception.

Fields:
- `visible`: whether the toggle is shown.
- `pressed`: whether activity view is currently open.
- `disabled`: whether the toggle is locked for the current phase.

Relationships:
- The toggle remains in the navigation bar even when every other action is consolidated into the footer.

## Validation Rules

- Every interactive control must resolve to exactly one surface: navigation bar or footer.
- The activity view toggle is always allowed in the navigation bar and is never copied into the footer.
- When a control is moved into the footer, its behavior and label remain unchanged.
- Narrow layouts may wrap or compress controls, but they must not create duplicate controls or hidden interactive affordances.

## Derived State Notes

- No new persisted entity is introduced.
- The source data remains the existing spec-viewer state and footer action catalog.
- The feature is a presentation rule over existing derived state, not a new schema.