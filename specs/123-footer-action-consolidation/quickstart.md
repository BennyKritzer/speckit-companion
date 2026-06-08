# Quickstart: Footer Action Consolidation

1. Install dependencies if needed with `npm install`.
2. Compile the extension with `npm run compile` or keep it rebuilding with `npm run watch`.
3. Open the repository in VS Code and press `F5` to launch the Extension Development Host.
4. Open the spec viewer for `specs/123-footer-action-consolidation` or any spec state that exposes footer actions.
5. Confirm the navigation bar shows only the activity view toggle as an interactive control.
6. Confirm every other action button appears in the footer and not in the navigation bar.
7. Resize the viewer narrow enough to exercise wrapping and confirm the footer controls remain readable and usable.
8. If you change the component stories, verify `NavigationBar.stories.tsx` and `FooterActions.stories.tsx` still reflect the updated layout.