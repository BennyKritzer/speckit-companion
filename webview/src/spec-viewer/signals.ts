/**
 * Reactive state for the spec viewer webview.
 * Legacy editor-local signals remain for inline editing and modal state.
 */

import { signal } from '@preact/signals';
import type { Refinement } from './types';

/** Pending refinements for GitHub-style review */
export const pendingRefinements = signal<Refinement[]>([]);

/** Currently active inline editor element */
export const activeEditor = signal<HTMLElement | null>(null);

/** Current line being refined (modal) */
export const refineLineNum = signal<number | null>(null);

/** Current content being refined (modal) */
export const refineContent = signal('');
