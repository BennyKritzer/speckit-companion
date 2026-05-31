import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { Writable, Readable } from 'stream';
import * as acp from '@agentclientprotocol/sdk';
import { AIProviders } from '../core/constants';
import { IAIProvider, AIOptions, AIExecutionResult } from './aiProvider';
import { getActiveSpecDir } from '../core/specDirectoryResolver';
import { completeStep } from '../features/specs/stepLifecycle';
import { readSpecContextSync } from '../features/specs/specContextManager';
import { StepName } from '../core/types/specContext';

class AcpClient implements acp.Client {
    private onCompletion: () => void;
    private onTerminalWrite: (msg: string) => void;

    constructor(onCompletion: () => void, onTerminalWrite: (msg: string) => void) {
        this.onCompletion = onCompletion;
        this.onTerminalWrite = onTerminalWrite;
    }

    async requestPermission(params: any): Promise<any> {
        this.onTerminalWrite(`\n🛠️  Tool Call Permission Requested: ${params.toolCall.title}\n`);
        if (params.options && params.options.length > 0) {
            const optionId = params.options[0].optionId;
            return {
                outcome: {
                    outcome: "selected",
                    optionId: optionId,
                },
            };
        }
        return { outcome: { outcome: "selected" } };
    }

    async sessionUpdate(params: any): Promise<void> {
        const update = params.update;
        switch (update.sessionUpdate) {
            case "agent_message_chunk":
                if (update.content.type === "text") {
                    this.onTerminalWrite(update.content.text);
                }
                break;
            case "tool_call":
                this.onTerminalWrite(`\n[Tool: ${update.title} - ${update.status}]\n`);
                break;
            case "tool_call_update":
                this.onTerminalWrite(`\n[Tool Status: ${update.status}]\n`);
                break;
            case "plan":
            case "agent_thought_chunk":
            case "user_message_chunk":
                break;
            default:
                break;
        }
    }

    async writeTextFile(params: any): Promise<any> { return {}; }
    async readTextFile(params: any): Promise<any> { return { content: "" }; }
}

export class AcpProvider implements IAIProvider {
    public readonly name = 'ACP Provider';
    public readonly type = AIProviders.ACP;
    public readonly managesOwnLifecycle = true;

    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;

    constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
        this.context = context;
        this.outputChannel = outputChannel;
    }

    async isInstalled(): Promise<boolean> {
        return true;
    }

    getPermissionFlag(): string {
        return '';
    }

    private getExecutablePath(): string {
        const config = vscode.workspace.getConfiguration('speckit');
        return config.get<string>('opencodePath', 'opencode');
    }

    async executeInTerminal(prompt: string, title: string = 'SpecKit - ACP', options?: AIOptions): Promise<vscode.Terminal> {
        // Use explicitly passed specDir, fallback to active editor detection
        const capturedSpecDir = options?.specDir || await getActiveSpecDir();
        this.outputChannel.appendLine(`[ACP] executeInTerminal capturedSpecDir=${capturedSpecDir}, options.specDir=${options?.specDir}`);

        const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!cwd) {
            throw new Error('No workspace folder open');
        }

        const cliPath = this.getExecutablePath();
        
        const writeEmitter = new vscode.EventEmitter<string>();
        const closeEmitter = new vscode.EventEmitter<number | void>();
        let userHasClosedTerminal = false;

        let inputBuffer = '';
        let userInputResolver: ((text: string) => void) | null = null;

        const pty: vscode.Pseudoterminal = {
            onDidWrite: writeEmitter.event,
            onDidClose: closeEmitter.event,
            open: () => {},
            close: () => {
                userHasClosedTerminal = true;
                if (userInputResolver) {
                    userInputResolver("");
                }
            },
            handleInput: (data: string) => {
                if (data === '\r') { // Enter
                    writeEmitter.fire('\r\n');
                    const text = inputBuffer;
                    inputBuffer = '';
                    if (userInputResolver) {
                        userInputResolver(text);
                        userInputResolver = null;
                    }
                } else if (data === '\x7f') { // Backspace
                    if (inputBuffer.length > 0) {
                        inputBuffer = inputBuffer.slice(0, -1);
                        writeEmitter.fire('\b \b');
                    }
                } else if (data === '\x03') { // Ctrl+C
                    writeEmitter.fire('^C\r\n');
                    if (userInputResolver) {
                        userInputResolver("break");
                        userInputResolver = null;
                    }
                } else {
                    inputBuffer += data;
                    writeEmitter.fire(data);
                }
            }
        };
        const terminal = vscode.window.createTerminal({ name: title, pty });
        terminal.show();

        // [User Request] Launch the standard CLI TUI in parallel using --continue
        const tuiTerminal = vscode.window.createTerminal({
            name: `${title} - TUI`,
            cwd,
            location: { viewColumn: vscode.ViewColumn.Two }
        });
        tuiTerminal.show(true);
        tuiTerminal.sendText(`${cliPath} --continue`, true);

        const agentArgs = ['acp'];

        const agentProcess = spawn(cliPath, agentArgs, {
            cwd,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Fail fast on crash
        agentProcess.on('exit', (code) => {
            if (code !== 0 && code !== null) {
                vscode.window.showErrorMessage(`ACP process crashed with code ${code}`);
                writeEmitter.fire(`\r\n\x1b[31mProcess exited with code ${code}\x1b[0m\r\n`);
                // Close internal stream
                closeEmitter.fire(code);
            }
        });

        agentProcess.stderr?.on('data', (data) => {
            writeEmitter.fire(`\x1b[33m${data.toString().replace(/\n/g, '\r\n')}\x1b[0m`);
        });

        const input = Writable.toWeb(agentProcess.stdin!);
        const output = Readable.toWeb(agentProcess.stdout!);
        const stream = acp.ndJsonStream(input, output);

        const onCompletion = async () => {
            this.outputChannel.appendLine('[ACP] onCompletion called.');
            writeEmitter.fire('\r\n[ACP] Executing completion logic...\r\n');
            try {
                if (capturedSpecDir) {
                    const ctx = readSpecContextSync(capturedSpecDir);
                    if (ctx && ctx.currentStep) {
                        await completeStep(capturedSpecDir, ctx.currentStep as StepName, 'ai');
                    }
                } else {
                    this.outputChannel.appendLine('[ACP] Warning: No capturedSpecDir found to complete.');
                }
            } catch (e) {
                this.outputChannel.appendLine(`[ACP] Error sending completion: ${e}`);
            }
        };

        const onTerminalWrite = (msg: string) => {
            writeEmitter.fire(msg.replace(/\n/g, '\r\n'));
        };

        const clientImpl = new AcpClient(onCompletion, onTerminalWrite);
        const connection = new acp.ClientSideConnection((_agent) => clientImpl, stream);

        let isHandshakeComplete = false;
        
        const timeout = setTimeout(async () => {
            if (!isHandshakeComplete) {
                agentProcess.kill();
                vscode.window.showErrorMessage('ACP connection timeout (15s). Executable may not be compliant.');
                writeEmitter.fire('\r\n\x1b[31mACP Handshake timed out after 15s.\x1b[0m\r\n');
                closeEmitter.fire(1);
                
                // Fast fail spec step on handshake timeout
                try {
                    if (capturedSpecDir) {
                        const ctx = readSpecContextSync(capturedSpecDir);
                        if (ctx && ctx.currentStep) {
                            await completeStep(capturedSpecDir, ctx.currentStep as StepName, 'ai');
                        }
                    }
                } catch (e) {
                    this.outputChannel.appendLine(`[ACP] Error sending failure completeStep: ${e}`);
                }
            }
        }, 15000);

        try {
            writeEmitter.fire('Initializing ACP connection...\r\n');
            const initResult = await connection.initialize({
                protocolVersion: acp.PROTOCOL_VERSION,
                clientCapabilities: { fs: { readTextFile: false, writeTextFile: false } }
            });

            isHandshakeComplete = true;
            clearTimeout(timeout);
            writeEmitter.fire(`Connected (Protocol v${initResult.protocolVersion})\r\n\r\n`);

            let sessionResult: any;

            if (options?.continue && 'listSessions' in connection && 'resumeSession' in connection) {
                try {
                    const listResult = await (connection as any).listSessions({});
                    if (listResult.sessions && listResult.sessions.length > 0) {
                        const lastSession = listResult.sessions[listResult.sessions.length - 1];
                        sessionResult = await (connection as any).resumeSession({
                            sessionId: lastSession.sessionId,
                            cwd
                        });
                        writeEmitter.fire(`Resumed session ${lastSession.sessionId}\r\n`);
                    }
                } catch (e) {
                    this.outputChannel.appendLine(`[ACP] Failed to resume session: ${e}`);
                }
            }

            if (!sessionResult) {
                sessionResult = await connection.newSession({
                    cwd,
                    mcpServers: [],
                });
            }

            if (options?.model && 'unstable_setSessionModel' in connection) {
                try {
                    await (connection as any).unstable_setSessionModel({
                        sessionId: sessionResult.sessionId,
                        modelId: options.model
                    });
                    writeEmitter.fire(`Model set to: ${options.model}\r\n`);
                } catch (e) {
                    this.outputChannel.appendLine(`[ACP] Failed to set model ${options.model}: ${e}`);
                }
            }

            if (options?.agent) {
                try {
                    await connection.setSessionConfigOption({
                        sessionId: sessionResult.sessionId,
                        configId: 'mode',
                        value: options.agent
                    } as any);
                    writeEmitter.fire(`Agent (mode) set to: ${options.agent}\r\n`);
                } catch (e) {
                    this.outputChannel.appendLine(`[ACP] Failed to set agent ${options.agent}: ${e}`);
                }
            }

            writeEmitter.fire(`Executing prompt...\r\n\r\n`);

            let nextPrompt: string | null = prompt;

            while (nextPrompt !== null && !userHasClosedTerminal) {
                const promptResult = await connection.prompt({
                    sessionId: sessionResult.sessionId,
                    prompt: [{ type: "text", text: nextPrompt }],
                });

                writeEmitter.fire(`\r\n\r\n✅ Agent completed with: ${promptResult.stopReason}\r\n`);

                if (promptResult.stopReason === "end_turn") {
                    writeEmitter.fire(`\r\n(Type your response and press Enter, or 'exit' / Ctrl+C to finish step)\r\n> `);
                    nextPrompt = await new Promise<string>((resolve) => {
                        userInputResolver = resolve;
                    });

                    if (nextPrompt.trim() === "exit" || nextPrompt.trim() === "quit" || nextPrompt === "break" || userHasClosedTerminal) {
                        break;
                    }
                    writeEmitter.fire(`\r\n`);
                } else {
                    break;
                }
            }
            
            await onCompletion();
            
            // Clean up resources cleanly when finishing
            try {
                agentProcess.kill();
            } catch (e) {}

        } catch (error) {
            clearTimeout(timeout);
            this.outputChannel.appendLine(`[ACP] Error: ${error}`);
            writeEmitter.fire(`\r\n\x1b[31mError: ${error}\x1b[0m\r\n`);
            agentProcess.kill();
            
            try {
                if (capturedSpecDir) {
                    const ctx = readSpecContextSync(capturedSpecDir);
                    if (ctx && ctx.currentStep) {
                        await completeStep(capturedSpecDir, ctx.currentStep as StepName, 'ai');
                    }
                }
            } catch (e) {}
        }

        return terminal;
    }

    async executeHeadless(prompt: string, options?: AIOptions): Promise<AIExecutionResult> {
        throw new Error('Headless execution is not supported by ACP provider.');
    }

    async executeSlashCommand(command: string, title: string = 'SpecKit - ACP', options?: AIOptions): Promise<vscode.Terminal> {
        return this.executeInTerminal(command, title, options);
    }
}
