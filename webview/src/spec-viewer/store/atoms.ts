import { atom } from 'jotai/vanilla';
import type { HistoryEntry, NavState, ViewerState } from '../types';

export const navStateAtom = atom<NavState | null>(null);
export const viewerStateAtom = atom<ViewerState | null>(null);
export const markdownHtmlAtom = atom('');
export const activityVisibleAtom = atom(false);
export const historyEntriesAtom = atom<HistoryEntry[]>([]);

export const activeSpecContextAtom = atom((get) => {
    const navState = get(navStateAtom);
    return navState
        ? {
            specName: navState.specContextName ?? null,
            branch: navState.branch ?? null,
            currentStep: navState.currentStep ?? null,
            status: navState.specStatus ?? null,
            history: navState.stepHistory ?? null,
        }
        : null;
});

export const specContentAtom = atom((get) => get(markdownHtmlAtom));

export const navigationAtom = atom((get) => {
    const navState = get(navStateAtom);
    if (!navState) return null;

    return {
        currentDoc: navState.currentDoc,
        workflowPhase: navState.workflowPhase,
        currentStep: navState.currentStep ?? null,
        activeStep: navState.activeStep ?? null,
        isViewingRelatedDoc: navState.isViewingRelatedDoc,
        coreDocs: navState.coreDocs,
        relatedDocs: navState.relatedDocs,
        taskCompletionPercent: navState.taskCompletionPercent,
    };
});

export const uiStateAtom = atom((get) => ({
    activityVisible: get(activityVisibleAtom),
    hasSpecContext: !!(get(navStateAtom)?.specContextName || get(navStateAtom)?.badgeText),
}));

export const runningStepAtom = atom((get) => {
    const navState = get(navStateAtom);
    if (!navState?.activeStep) return null;

    const entry = navState.stepHistory?.[navState.activeStep];
    if (!entry?.startedAt || entry.completedAt) return null;

    return {
        step: navState.activeStep,
        startedAt: navState.runningStepStartedAt ?? entry.startedAt,
        label: navState.runningStepLabel ?? navState.activeStep,
        artifactReady: !!navState.runningStepArtifactReady,
    };
});

export const runningStepStartedAtAtom = atom((get) => get(runningStepAtom)?.startedAt ?? null);
export const runningStepLabelAtom = atom((get) => get(runningStepAtom)?.label ?? null);
export const runningStepArtifactReadyAtom = atom((get) => get(runningStepAtom)?.artifactReady ?? false);
export const isGeneratingAtom = atom((get) => {
    const navState = get(navStateAtom);
    if (!navState?.activeStep) return false;

    const entry = navState.stepHistory?.[navState.activeStep];
    if (!entry?.startedAt || entry.completedAt) return false;

    return !get(runningStepArtifactReadyAtom);
});
