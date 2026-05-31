# Data Model

## State Transitions
1. **Init**: The ACProvider spawns CLI child process, creates `Pseudoterminal`, initializes ACP SDK Client.
2. **Handshake**: Provider waits up to 15 seconds for ACP JSON-RPC handshake to succeed.
    - If failure/timeout: UI warning and cleanup. Throw error so workflow halts.
3. **Execution**: Provider issues task via SDK to agent. SDK handles messaging.
4. **Streaming**: Agent outputs raw standard execution strings which are intercepted, normalized (ANSI formatting preserved via `Pseudoterminal` write bounds), then pumped to UI.
5. **Completion**: SDK yields `taskStateChanged` bounded event denoting termination (`completed` or `failed`).
    - Action: `completeStep(activeSpecDir, currentStepName, 'agent')` is explicitly triggered.
6. **Continuation**: If terminal is manually closed by the user, extension ignores `onDidCloseTerminal`. Child process continues transparently in the background until Completion step runs.

