---
description: "Task list template for feature implementation"
---

# Tasks: ACP AI Provider

**Input**: Design documents from `/specs/118-acp-provider/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Update dependencies to add `@agentclientprotocol/sdk` in `package.json`
- [X] T002 Update `speckit.aiProvider` configuration enum to include "acp" in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Add `readonly managesOwnLifecycle?: boolean` to `IAIProvider` interface in `src/ai-providers/aiProvider.ts`
- [X] T004 [P] Add `ACP` to `AIProviders` enum and `PROVIDER_PATHS` configuration in `src/core/constants.ts`
- [X] T005 Update `specCommands.ts` lifecycle tracking to verify `!provider.managesOwnLifecycle` before calling `trackTerminal()` in `src/features/specs/specCommands.ts`
- [X] T006 Update `AIProviderFactory` to import and instantiate `AcpProvider` for the `ACP` enum type in `src/ai-providers/aiProviderFactory.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Configure and Use ACP Provider (Priority: P1) 🎯 MVP

**Goal**: Implement an ACP provider that streams standard I/O interactively to VS Code pseudo-terminals while internally completing tasks via SDK signals.

**Independent Test**: Can be tested by configuring the extension to use the `acp` provider and triggering a command that streams back terminal text without destroying the terminal.

### Implementation for User Story 1

- [X] T007 [US1] Create foundation for `AcpProvider` class implementing `IAIProvider` with `managesOwnLifecycle = true` in `src/ai-providers/acpProvider.ts`
- [X] T008 [US1] Implement `executeInTerminal` using `vscode.window.createTerminal` to bootstrap a `Terminal` (via `Pseudoterminal` emulation) in `src/ai-providers/acpProvider.ts`
- [X] T009 [US1] Implement `child_process.spawn()` with appropriate stdio binding for PTY/StdioClientTransport logic and bind it to the `StdioClientTransport` from `@agentclientprotocol/sdk` in `AcpProvider`
- [X] T010 [US1] Connect SDK events to pipe raw agent stdout strings efficiently to the active UI `Pseudoterminal` in `src/ai-providers/acpProvider.ts`
- [X] T011 [US1] Implement strict 15-second JSON-RPC handshake connection timeout in `AcpProvider`
- [X] T012 [US1] Implement Fail Fast & Notify error notification flow for unexpected `child_process` crashes prior to task completion in `AcpProvider`
- [X] T013 [US1] Subscribe to SDK `client.on('taskStateChanged')` events representing `done`/`completed` and invoke `completeStep()` explicitly
- [X] T014 [US1] Implement "Detach and Continue" tracking so `onDidCloseTerminal` gracefully allows child process persistence in background via `AcpProvider`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T015 Verify pseudoterminal properly maintains control strings and cleanly destroys instances where applicable
- [X] T016 Run quickstart.md validation to ensure exact end-to-end functionality described

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Parallel Opportunities

- Foundational updates to `src/ai-providers/aiProvider.ts` and `src/core/constants.ts` can run in parallel
- Adding the package dependencies can be handled parallel to setting up enums
