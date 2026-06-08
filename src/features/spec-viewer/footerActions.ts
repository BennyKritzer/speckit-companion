/**
 * Footer action catalog with scope metadata and visibility rules.
 *
 * - Every action declares `scope: 'spec' | 'step'` (FR-009).
 * - Tooltips are auto-suffixed with a scope phrase at render time.
 * - The `Approve` button's visible label is the next step's label
 *   (e.g. `Plan`, `Tasks`, `Implement`) when a workflow definition is
 *   provided, falling back to `Approve` / `Complete`.
 * - `Archive` and `Mark Completed` are gated by `isSpecDone(ctx)` so
 *   they only surface once the spec has reached the closure-eligible
 *   stages (`ready-to-implement` / `implementing` / `completed`). The
 *   user never sees them while a step is mid-generation.
 * - The legacy `Start` and `SDD_AUTO` actions have been removed:
 *   - `Start` is structurally unreachable — the viewer only opens
 *     after a step has been initiated.
 *   - Auto belongs in the Create-New-Spec UI (`Auto Mode` next to
 *     `Submit`), not in the post-creation viewer footer.
 */

import {
    FooterAction,
    SpecContext,
    StepHistoryEntry,
    StepName,
    STEP_NAMES,
} from '../../core/types/specContext';
import { SpecStatuses, FooterActionIds } from '../../core/constants';
import { deriveStepHistory } from '../specs/stepHistoryDerivation';
import type { WorkflowStepConfig } from '../workflows/types';

type DerivedHistory = Record<string, StepHistoryEntry>;

const SCOPE_SUFFIX: Record<'spec' | 'step', string> = {
    spec: 'Affects whole spec',
    step: 'Affects this step',
};

export function withScopeSuffix(a: FooterAction): string {
    return `${a.tooltip} (${SCOPE_SUFFIX[a.scope]})`;
}

/** Spec is in a terminal state — no step-scoped actions should surface. */
function isTerminal(status: string | undefined): boolean {
    return status === SpecStatuses.COMPLETED || status === SpecStatuses.ARCHIVED;
}

function getStepConfig(step: StepName, workflowSteps?: WorkflowStepConfig[]): WorkflowStepConfig | undefined {
    return workflowSteps?.find(s => s.name === step);
}

/**
 * True once the spec has reached a closure-eligible stage. Tightened
 * to just `implemented` + `completed`: while the AI is still creating
 * tasks or building (`tasks-created`, `implementing`), the footer
 * stays focused on the forward action and the sidebar's per-row
 * Archive remains the escape hatch. `Mark Completed` and `Archive`
 * only appear once the build is done and the user is at the final
 * approval gate.
 */
function isSpecDone(ctx: SpecContext, stepHistory?: DerivedHistory): boolean {
    if (
        ctx.status === 'implemented' ||
        ctx.status === 'finalized' ||
        ctx.status === SpecStatuses.COMPLETED
    ) {
        return true;
    }

    // Special case for implement phase: once all tasks are checked,
    // the spec is "done" enough to show the final closure controls.
    const implement = stepHistory?.['implement'];
    if (implement?.substeps && implement.substeps.length > 0) {
        return implement.substeps.every(s => !!s.completedAt);
    }

    return false;
}

/**
 * Decide whether `Approve` should surface for `step`.
 *
 * Visible when:
 * - the step has been started, AND
 * - no later step in `STEP_NAMES` has acquired a `startedAt` (the
 *   workflow has not moved past this tab), AND
 * - either the step is in flight (no `completedAt`) OR there's still
 *   a later step in the workflow to advance to.
 *
 * The "later step exists" check is what hides `Approve` once the
 * final step (`implement`) has its `completedAt` — at that point the
 * spec-scope `Mark Completed` is the right surface, not Approve.
 */
function shouldShowApprove(
    ctx: SpecContext,
    step: StepName,
    stepHistory: DerivedHistory,
    workflowSteps?: WorkflowStepConfig[]
): boolean {
    const stepList = workflowSteps ? workflowSteps.map(s => s.name) : STEP_NAMES;
    
    // The final step closure is owned by `Mark Completed` (gated on
    // `isSpecDone(ctx)`). Approve here would surface a duplicate
    // "Complete" button before status actually flips.
    // if (step === stepList[stepList.length - 1]) return false;
    
    // Approve must target the spec's actual current step. When the user
    // navigates backward via the stepper, dispatching the next step from
    // a past tab would re-run already-completed phases.
    if (step !== ctx.currentStep) return false;
    
    const entry = stepHistory[step];
    if (!entry?.startedAt) return false;
    
    let idx = stepList.indexOf(step as StepName);
    // If a custom/enhancement step like 'clarify' isn't in the workflow definition,
    // fallback to its position in the universal STEP_NAMES to allow progression.
    if (idx < 0) {
        idx = STEP_NAMES.indexOf(step as StepName);
        if (idx < 0) return false;
        
        // In fallback mode, we just ensure it's not the very last possible step
        if (!entry.completedAt) return true;
        return idx < STEP_NAMES.length - 1;
    }

    // The final step closure is owned by `Mark Completed` (gated on
    // `isSpecDone(ctx)`). Approve here would surface a duplicate
    // "Complete" button before status actually flips.
    if (idx === stepList.length - 1) return false;
    
    // Any later step started → workflow has moved past this tab.
    for (let i = idx + 1; i < stepList.length; i++) {
        if (stepHistory[stepList[i]]?.startedAt) return false;
    }
    
    // Step in flight → always show.
    if (!entry.completedAt) return true;
    
    // Step is done → only show if there's a later step left to dispatch.
    return idx < stepList.length - 1;
}

/**
 * Resolve the visible label for the `Approve` action based on the active
 * workflow's step ordering. Returns the next step's label, or `Complete`
 * for the final step, or `Approve` if the workflow definition is missing.
 */
export function getApproveLabel(
    currentStep: StepName,
    workflowSteps: WorkflowStepConfig[] | undefined
): string {
    if (!workflowSteps || workflowSteps.length === 0) return 'Approve';
    let idx = workflowSteps.findIndex(s => s.name === currentStep);
    
    // For out-of-band enhancement steps like 'clarify', infer the next workflow step 
    // by finding the first configured step occurring after it in the master STEP_NAMES list
    if (idx < 0) {
        const masterIdx = STEP_NAMES.indexOf(currentStep);
        if (masterIdx >= 0) {
            for (let i = masterIdx + 1; i < STEP_NAMES.length; i++) {
                const targetName = STEP_NAMES[i];
                const found = workflowSteps.find(ws => ws.name === targetName);
                if (found) return found.label ?? capitalize(found.name);
            }
        }
        return 'Approve';
    }
    
    const next = workflowSteps[idx + 1];
    if (!next) return 'Complete';
    return next.label ?? capitalize(next.name);
}

function capitalize(s: string): string {
    return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

export const FOOTER_ACTIONS: FooterAction[] = [
    {
        id: FooterActionIds.ARCHIVE,
        label: 'Archive',
        scope: 'spec',
        tooltip: 'Archive this spec',
        visibleWhen: (ctx, step, stepHistory) =>
            ctx.status !== SpecStatuses.ARCHIVED && isSpecDone(ctx, stepHistory),
    },
    {
        id: FooterActionIds.REACTIVATE,
        label: 'Reactivate',
        scope: 'spec',
        tooltip: 'Reactivate archived spec',
        visibleWhen: (ctx) =>
            ctx.status === SpecStatuses.ARCHIVED || ctx.status === SpecStatuses.COMPLETED,
    },
    {
        id: FooterActionIds.COMPLETE,
        label: 'Mark Completed',
        scope: 'spec',
        tooltip: 'Mark this spec as completed',
        visibleWhen: (ctx, step, stepHistory) => !isTerminal(ctx.status) && isSpecDone(ctx, stepHistory),
    },
    {
        id: FooterActionIds.REGENERATE,
        label: 'Regenerate',
        scope: 'step',
        tooltip: 'Re-run only the current step',
        visibleWhen: (ctx, step, stepHistory) => {
            if (isTerminal(ctx.status)) return false;
            const entry = stepHistory[step];
            return !!entry?.startedAt;
        },
    },
    {
        id: FooterActionIds.SKIP,
        label: 'Skip',
        scope: 'step',
        tooltip: 'Skip this optional step',
        visibleWhen: (ctx, step, stepHistory, workflowSteps) => {
            if (isTerminal(ctx.status)) return false;
            if (step !== ctx.currentStep) return false;
            const entry = stepHistory[step];
            if (!entry?.startedAt || entry.completedAt || entry.skippedAt) return false;
            return !!getStepConfig(step, workflowSteps)?.optional;
        },
    },
    {
        id: FooterActionIds.UNSKIP,
        label: 'Unskip',
        scope: 'step',
        tooltip: 'Restore this skipped step',
        visibleWhen: (ctx, step, stepHistory, workflowSteps) => {
            if (isTerminal(ctx.status)) return false;
            if (step !== ctx.currentStep) return false;
            const entry = stepHistory[step];
            if (!entry?.startedAt || !entry.skippedAt) return false;
            return !!getStepConfig(step, workflowSteps)?.optional;
        },
    },
    {
        id: FooterActionIds.APPROVE,
        label: 'Approve',
        scope: 'step',
        tooltip: 'Approve this step and continue',
        // Note: we pass workflowSteps dynamically in getFooterActions now to support custom workflows
        visibleWhen: (ctx, step, stepHistory, workflowSteps) => {
            if (isTerminal(ctx.status)) return false;
            return shouldShowApprove(ctx, step, stepHistory, workflowSteps);
        },
    },
];

export function getFooterActions(
    ctx: SpecContext,
    step: StepName,
    workflowSteps?: WorkflowStepConfig[],
    stepHistory: DerivedHistory = deriveStepHistory(ctx.history ?? [], ctx.currentStep, ctx.status)
): FooterAction[] {
    const visible = FOOTER_ACTIONS.filter(a => a.visibleWhen(ctx, step, stepHistory, workflowSteps));
    return visible.map(a =>
        a.id === FooterActionIds.APPROVE
            ? { ...a, label: getApproveLabel(step, workflowSteps) }
            : a
    );
}
