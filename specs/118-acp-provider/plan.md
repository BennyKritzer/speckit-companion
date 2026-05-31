# Implementation Plan: ACP AI Provider

**Branch**: `118-acp-provider` | **Date**: May 30, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/118-acp-provider/spec.md`

## Summary

Implement a new `AcpProvider` that implements SpecKit's `IAIProvider` interface, designed to spawn the Agent Client Protocol (ACP) CLI as a continuous `stdio` child process rather than a fire-and-forget shell command. The provider manages its own lifecycle using an Event-Driven Integration (listening to the ACP SDK `taskStateChanged`), allowing the Webview UI to instantly react to task completions while the continuous process (and its rich TUI visualization via a true PTY or `Pseudoterminal`) stays alive.

## Technical Context

**Language/Version**: TypeScript 5.3+ (ES2022 target, strict mode)
**Primary Dependencies**: VS Code Extension API (`@types/vscode ^1.84.0`), `@agentclientprotocol/sdk`, native Node `child_process`
**Storage**: N/A
**Testing**: Jest
**Target Platform**: VS Code Extension (Desktop & Web)
**Project Type**: VS Code Extension Feature
**Performance Goals**: Fast connection (<1s), fluid real-time interactivity (<200ms latency)
**Constraints**: Manage own lifecycle without terminating on completion. Handle process crash (fail fast), unsupported executable (15s timeout), and manual terminal closure (detach and continue). 
**Scale/Scope**: 1 new AI provider, minor integration wiring into commands and core registry.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Extensibility and Configuration**: PASS - Adding `AcpProvider` implements `IAIProvider` without requiring full rewrites. Configuration exposed via `speckit.aiProvider` enum update.
- **II. Spec-Driven Workflow**: PASS - Directly improves Spec-Driven Workflow execution via the new provider. Uses `completeStep()` gracefully without corrupting workflow semantics.
- **III. Visual and Interactive**: PASS - Renders real-time native Terminal UI for observability while interacting transparently via non-destructive SDK completion events.
- **IV. Modular Architecture for Complex Features**: PASS - Adding a dedicated `acpProvider.ts` follows existing provider structure.

## Project Structure

### Documentation (this feature)

```text
specs/118-acp-provider/
├── plan.md              # This file
├── research.md          # Implementation choices and rationale
├── data-model.md        # AI Provider state behavior
└── tasks.md             # Tasks to be generated
```

### Source Code

```text
src/
├── ai-providers/
│   ├── acpProvider.ts              # New ACP Provider implementation
│   ├── aiProvider.ts               # Modify definition (optional: managesOwnLifecycle)
│   └── aiProviderFactory.ts        # Map ACP enum to provider
├── core/
│   └── constants.ts                # Update enums/symbols
└── features/
    └── specs/
        └── specCommands.ts         # Hook to ignore trackTerminal if provider manages lifecycle
package.json                        # Add `acp` to enum, add ACP SDK dependency
```

**Structure Decision**: Extending the existing `ai-providers` architecture with a new provider file.
