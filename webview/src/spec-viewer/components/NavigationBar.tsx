import type { VSCodeApi } from '../types';
import { activityVisibleAtom, navStateAtom } from '../store/atoms';
import { specViewerStore } from '../store/store';
import { StepTab } from './StepTab';
import { useStoreAtomValue } from '../store/useStoreAtom';

declare const vscode: VSCodeApi;

export function NavigationBar() {
    const ns = useStoreAtomValue(navStateAtom);
    const activityVisible = useStoreAtomValue(activityVisibleAtom);
    if (!ns) return null;

    const { coreDocs, relatedDocs, currentDoc, workflowPhase,
        taskCompletionPercent, isViewingRelatedDoc, activeStep,
        currentStep, stepHistory, stalenessMap } = ns;

    const viewingRelatedDoc = isViewingRelatedDoc
        ? relatedDocs.find(d => d.type === currentDoc)
        : undefined;
    const parentPhaseForRelated = viewingRelatedDoc?.parentStep || coreDocs?.[0]?.type || 'spec';

    // Index of the step currently running — derive from stepHistory
    // (entry with startedAt set and no completedAt). Future tabs beyond this
    // index get locked while the step is in-flight.
    const runningStepIndex = (() => {
        if (!stepHistory) return null;
        for (const [stepKey, entry] of Object.entries(stepHistory)) {
            if (entry?.startedAt && !entry?.completedAt) {
                const idx = coreDocs.findIndex(d => d.type === stepKey);
                if (idx >= 0) return idx;
            }
        }
        return null;
    })();

    const handleClick = (phase: string) => {
        vscode.postMessage({ type: 'stepperClick', phase });
    };

    const handleRelatedClick = (docType: string) => {
        vscode.postMessage({ type: 'switchDocument', documentType: docType });
    };

    // Related tabs for the current step — rendered in a right-aligned slot
    // inside .nav-primary (R010, R011). The Overview tab is removed since
    // the parent step-tab itself routes to the overview.
    const isVisible = (d: typeof relatedDocs[number]) => d.exists;
    const relevantRelatedDocs = relatedDocs.filter(d =>
        d.parentStep === currentDoc && isVisible(d)
    );
    const displayRelatedDocs = isViewingRelatedDoc
        ? relatedDocs.filter(d => {
            return (!d.parentStep || d.parentStep === viewingRelatedDoc?.parentStep) && isVisible(d);
        })
        : relevantRelatedDocs;

    // Parent step for the second-row children rail. When viewing a core step,
    // that step is its own parent; when viewing a related doc, parent comes from
    // the doc's parentStep field. Including the parent as the first child tab
    // gives users a single way back to the step's overview from any sub-doc.
    const parentStepType = isViewingRelatedDoc
        ? viewingRelatedDoc?.parentStep
        : currentDoc;
    const parentStepDoc = coreDocs.find(d => d.type === parentStepType);
    const showChildrenRow = displayRelatedDocs.length > 0 && parentStepDoc;

    const activityMode = ns.activityPanelMode ?? 'beta';
    const isActionOnlyDoc = coreDocs.find(d => d.type === currentDoc)?.actionOnly ?? false;
    const activityActive = activityVisible || isActionOnlyDoc;
    
    const handleActivityToggle = () => {
        if (isActionOnlyDoc) return; // Locked open when in actionOnly phase
        specViewerStore.set(activityVisibleAtom, !activityVisible);
    };

    return [
        <div class="nav-primary" key="nav-primary">
            <div class="step-tabs">
                {coreDocs.map((doc, i) => {
                    const hasRelatedChildren = relatedDocs.some(d => d.parentStep === doc.type);
                    const exists = doc.exists || hasRelatedChildren || !!doc.actionOnly;
                    return [
                        <StepTab
                            key={doc.type}
                            doc={doc}
                            index={i}
                            totalSteps={coreDocs.length}
                            currentDoc={currentDoc}
                            workflowPhase={workflowPhase}
                            taskCompletionPercent={taskCompletionPercent}
                            isViewingRelatedDoc={isViewingRelatedDoc}
                            parentPhaseForRelated={parentPhaseForRelated}
                            activeStep={activeStep}
                            currentStep={currentStep}
                            stepHistory={stepHistory}
                            stalenessMap={stalenessMap}
                            hasRelatedChildren={hasRelatedChildren}
                            runningStepIndex={runningStepIndex}
                            onClick={handleClick}
                        />,
                        i < coreDocs.length - 1 && (
                            <span key={`${doc.type}-connector`} class={`step-connector ${exists ? 'filled' : ''}`} />
                        ),
                    ];
                })}
            </div>
            <div class="nav-right-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                {ns.footerState?.showApproveButton && ns.footerState?.approveText && (
                    <button
                        type="button"
                        onClick={() => vscode.postMessage({ type: 'approve' })}
                        style={{
                            background: 'color-mix(in srgb, var(--vscode-button-background) 85%, transparent)',
                            color: 'var(--vscode-button-foreground)',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                        onMouseOver={(e: any) => e.target.style.background = 'var(--vscode-button-hoverBackground)'}
                        onMouseOut={(e: any) => e.target.style.background = 'color-mix(in srgb, var(--vscode-button-background) 85%, transparent)'}
                        title={`Proceed to ${ns.footerState.approveText}`}
                    >
                        {ns.footerState.approveText} <span style={{ marginLeft: '4px', opacity: 0.8, fontSize: '14px', lineHeight: 1 }}>→</span>
                    </button>
                )}
                {activityMode !== 'off' && (
                    <button
                        type="button"
                        class="activity-toggle"
                        style={{ marginLeft: 0, opacity: isActionOnlyDoc ? 0.5 : 1, cursor: isActionOnlyDoc ? 'default' : 'pointer' }}
                        aria-pressed={activityActive}
                        disabled={isActionOnlyDoc}
                        title={isActionOnlyDoc ? "Activity view is required for this phase" : "Toggle the activity overview for this spec"}
                        onClick={handleActivityToggle}
                    >
                        Activity
                        {activityMode === 'beta' && (
                            <span class="activity-toggle__beta">beta</span>
                        )}
                    </button>
                )}
            </div>
        </div>,
        showChildrenRow && !activityActive && (
            <div class="step-children" aria-label={`${parentStepDoc.label} files`}>
                <div class="step-children-tabs">
                    <button
                        key={parentStepDoc.type}
                        class={`step-child step-child--parent ${parentStepDoc.type === currentDoc ? 'active' : ''}`}
                        data-doc={parentStepDoc.type}
                        onClick={() => handleRelatedClick(parentStepDoc.type)}
                    >
                        {parentStepDoc.label}
                    </button>
                    {displayRelatedDocs.map(doc => (
                        <button
                            key={doc.type}
                            class={`step-child ${doc.type === currentDoc ? 'active' : ''}`}
                            data-doc={doc.type}
                            onClick={() => handleRelatedClick(doc.type)}
                        >
                            {doc.label}
                        </button>
                    ))}
                </div>
            </div>
        ),
    ];
}
