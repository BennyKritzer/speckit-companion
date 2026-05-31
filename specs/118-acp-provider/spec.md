# Feature Specification: ACP AI Provider

**Feature Branch**: `[118-acp-provider]`  
**Created**: May 30, 2026  
**Status**: Draft  
**Input**: User description: "I need to add a new AI Provider to the VS Code SpecKit Companion extension that utilizes the Agent Client Protocol (ACP) over `stdio` using the official ACP SDK. Please implement a new `AcpProvider` that complies with SpecKit's `IAIProvider` interface, but acts continuously rather than doing a one-shot process execution. It needs to spawn the CLI as a `stdio` child process, connect the ACP SDK to the process streams, and pipe output back."

## Clarifications

### Session 2026-05-30
- Q: How should the extension handle rich terminal interfaces (TUIs) for the running process? → A: Full TUI Support (Bind subprocess to a true PTY mechanism or adequately emulate via `vscode.Pseudoterminal` to preserve TUI rendering, as it already renders properly).
- Q: How should the system handle a child process crash before completion? → A: Fail Fast & Notify (Automatically fail the active step and show an error).
- Q: What happens when the user manually closes the VS Code Terminal panel? → A: Detach and Continue (Child process continues running in the background and completes task via SDK).
- Q: How does the system handle an unsupported ACP executable? → A: Graceful Timeout & Error (Enforce 15-second handshake timeout; abort with error if not established).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure and Use ACP Provider (Priority: P1)

As a developer and user of the SpecKit Companion extension, I want to be able to configure and use an Agent Client Protocol (ACP) based AI provider. I want this provider to run interactively over stdio, streaming the output natively into a VS Code Terminal in real-time.

**Why this priority**: Without this fundamental capability, the ACP provider cannot be used to execute AI tasks interactively within the bounds of SpecKit, establishing the core value proposition.

**Independent Test**: Can be tested by configuring the extension to use the `acp` AI provider, triggering a spec generation task, and verifying that the `opencode acp` CLI child process executes interactively with real-time output in the terminal.

**Acceptance Scenarios**:

1. **Given** the extension is configured to use the `acp` provider, **When** a command is executed that triggers `executeInTerminal`, **Then** the ACP SDK starts a child process using `stdio` transport.
2. **Given** the ACP provider process is running, **When** the provider outputs messages to its stdout/stderr streams, **Then** these messages are relayed cleanly and in real-time to the VS Code pseudoterminal interface.
3. **Given** the ACP provider completes its logical task, **When** the `taskStateChanged` event yields a `done` or `completed` state, **Then** the SpecKit backend programmatic completion signal (`completeStep`) is invoked securely.

### Edge Cases

- **Process Crash**: If the child process unexpectedly exits or crashes with a non-zero code before the SDK reports `done`, the provider MUST fail fast, abort the active SpecKit step to prevent UI hangs, and show an error notification.
- **Unsupported Executable**: Enforce a strict 15-second connection timeout. If the JSON-RPC protocol handshake isn't established within 15 seconds, abort the process and notify the user the executable isn't ACP-compliant.
- **Terminal Closure**: If the user manually closes the VS Code Terminal panel attached to the ACP provider, the child process MUST detach and continue running in the background. The task completes normally when the SDK receives the internal `done` signal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an interface implementation for interacting with capabilities exposing the Agent Client Protocol.
- **FR-002**: System MUST boot the external agent capability natively as a continuous subprocess and establish bidirectional communication streams.
- **FR-003**: System MUST provide real-time visibility to the user by exposing the continuous subprocess's output stream within the editor's UI without using external shell execution environments.
- **FR-004**: System MUST attach the official protocol client to the subprocess data streams to dispatch execution messages.
- **FR-005**: System MUST manage its own task lifecycle tracking, disregarding the standard process-termination signals used by one-shot tools.
- **FR-006**: System MUST subscribe to task state progression events from the protocol client to determine when a task is fully complete.
- **FR-007**: System MUST explicitly signal task completion to the core application upon receiving a terminating state from the protocol client.
- **FR-008**: System MUST register necessary symbols and commands to expose this new integration as a selectable configuration option.

### Technical Constraints & Assumptions

- The solution MUST be implemented using Node.js native `child_process.spawn()` with specialized arguments (e.g., configuring `stdio` dynamically or using a PTY to preserve TUI rendering while tracking RPC).
- The solution MUST utilize the official `@agentclientprotocol/sdk` TypeScript packages (e.g., `StdioClientTransport`).
- The solution MUST leverage a true PTY mechanism (like `node-pty`) or adequately emulate it via `vscode.Pseudoterminal` to preserve and properly render interactive TUI formatting and ANSI control sequences within the VS Code terminal.
- `AcpProvider` MUST enforce `public readonly managesOwnLifecycle = true;` to instruct the base workflow to cede lifecycle authority.
- The workflow completion signal MUST specifically invoke `completeStep(activeSpecDir, currentStepName, 'agent')`.

### Key Entities

- **ACP Integration**: The implementation encapsulating protocol utilization, tracking progression events, and bridging output to the presentation layer.
- **Presentation Layer**: The interactive bounding box exposing textual updates from the running subprocess to the end-user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The ACP Provider connects to the Agent Client Protocol CLI within 1 second of task invocation.
- **SC-002**: stdout/stderr information emitted from the child process is viewable in the terminal within 200 milliseconds of actual generation (establishing fluid real-time interactivity).
- **SC-003**: Spec completion signal is broadcast successfully and unambiguously 100% of the time upon an ACP SDK terminating state (freeing the associated SpecKit webview from loading states).
- **SC-004**: Manually closing the tracking UI terminal yields no cascading failure or hung states within the broader Spec Kit application.