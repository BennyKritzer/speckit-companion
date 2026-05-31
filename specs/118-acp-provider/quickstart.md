# Quickstart

1. Configure VS Code `speckit.aiProvider` to `acp`.
2. Ensure you have an ACP-compliant CLI installed (e.g. `opencode acp`).
3. Run a SpecKit command like `speckit.clarify` through the UI.
4. A new virtual terminal panel will appear immediately displaying real-time TUI text streamed directly from the `opencode` instance via standard pipes.
5. The extension UI will automatically advance as soon as the `opencode` process signals an internal completion event via `@agentclientprotocol/sdk`, even if you leave the terminal open!
