# Phase 0: Research

## Decisions

### 1. ACP Communication Transport
- **Decision**: Use the official `@agentclientprotocol/sdk` utilizing the `StdioClientTransport`.
- **Rationale**: To seamlessly intercept raw `child_process` output. Using the official SDK abstracts JSON-RPC buffering, provides strong typings, and correctly implements event mapping (e.g. `client.on('taskStateChanged')`).
- **Alternatives considered**: Manually listening to `stdout.on('data')`, parsing buffered JSON chunks. Rejected due to fragility and non-compliance risks.

### 2. TUI Rendering (Terminal Visibility)
- **Decision**: Expose the child process's stdout/stderr continuously via a VS Code `Pseudoterminal` via `window.createTerminal`. Wait, `Pseudoterminal` must correctly parse incoming ANSI bytes from `child_process` stream (raw PTY). Node's `node-pty` may be heavy, but VS Code's extension API comes with `vscode.Pseudoterminal` which natively renders string emissions with ANSI. The decision is to use `vscode.Pseudoterminal`.
- **Rationale**: Retains the rich visual interactive TUI of tools like `opencode acp` while freeing SpecKit from coupling step completions to terminal exits. 
- **Alternatives considered**: Passing `inherit` to standard shell instances, or relying solely on a headless run. Rejected since continuous visualization was specifically requested while managing completion programmatically.

### 3. Lifecycle Tracking Override
- **Decision**: Define `managesOwnLifecycle = true;` inside `AcpProvider` and check this property inside `specCommands.ts` before calling `trackTerminal()`.
- **Rationale**: Tells the extension's terminal tracker logic to gracefully ignore the terminal spawned by `AcpProvider`, allowing the ACP event-driven handler `taskStateChanged` to invoke `completeStep(activeSpec, currentStep, 'agent')` directly when finished.
- **Alternatives considered**: Returning a specialized data structure or `undefined` instead of a `Terminal`. While returning `undefined` averts `trackTerminal`, it breaks standard typings/interfaces if it expects `vscode.Terminal`, so overriding tracking semantics via an object flag is more explicit.
