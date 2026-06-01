import type { HistoryEntry, NavState, ViewerState } from '../types';
import { activityVisibleAtom, historyEntriesAtom, markdownHtmlAtom, navStateAtom, viewerStateAtom } from './atoms';
import { specViewerStore } from './store';

export interface SpecViewerStoryState {
    navState?: NavState | null;
    viewerState?: ViewerState | null;
    markdownHtml?: string;
    activityVisible?: boolean;
    historyEntries?: HistoryEntry[];
}

export function setSpecViewerStoryState(state: SpecViewerStoryState): void {
    specViewerStore.set(navStateAtom, state.navState ?? null);
    specViewerStore.set(viewerStateAtom, state.viewerState ?? null);
    specViewerStore.set(historyEntriesAtom, state.historyEntries ?? state.viewerState?.history ?? []);
    specViewerStore.set(markdownHtmlAtom, state.markdownHtml ?? '');
    specViewerStore.set(activityVisibleAtom, state.activityVisible ?? false);
}

export function resetSpecViewerStoryState(): void {
    setSpecViewerStoryState({
        navState: null,
        viewerState: null,
        markdownHtml: '',
        activityVisible: false,
        historyEntries: [],
    });
}