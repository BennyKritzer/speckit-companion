import { getFooterActions } from '../footerActions';
import type { SpecContext, StepHistoryEntry } from '../../../core/types/specContext';
import type { WorkflowStepConfig } from '../../workflows/types';

function makeContext(overrides: Partial<SpecContext> = {}): SpecContext {
    return {
        workflow: 'speckit',
        specName: 'test',
        branch: 'main',
        currentStep: 'specify',
        status: 'draft',
        history: [],
        ...overrides,
    };
}

const workflowSteps: WorkflowStepConfig[] = [
    { name: 'specify', command: 'speckit.specify', file: 'spec.md' },
    { name: 'checklist', command: 'speckit.checklist', file: 'checklists/checklist.md', optional: true },
    { name: 'tasks', command: 'speckit.tasks', file: 'tasks.md' },
];

const started = (overrides: Partial<StepHistoryEntry> = {}): StepHistoryEntry => ({
    startedAt: '2026-06-08T10:00:00Z',
    completedAt: null,
    ...overrides,
});

describe('getFooterActions', () => {
    it('shows Skip for the current optional step', () => {
        const ctx = makeContext({ currentStep: 'checklist', status: 'tasking' });
        const actions = getFooterActions(
            ctx,
            'checklist',
            workflowSteps,
            { checklist: started() },
        );

        expect(actions.map(a => a.id)).toContain('skip');
        expect(actions.map(a => a.id)).not.toContain('unskip');
    });

    it('shows Unskip after the optional step is skipped', () => {
        const ctx = makeContext({ currentStep: 'checklist', status: 'tasking' });
        const actions = getFooterActions(
            ctx,
            'checklist',
            workflowSteps,
            { checklist: started({ skippedAt: '2026-06-08T10:05:00Z' }) },
        );

        expect(actions.map(a => a.id)).toContain('unskip');
        expect(actions.map(a => a.id)).not.toContain('skip');
    });

    it('hides Skip for non-optional steps', () => {
        const ctx = makeContext({ currentStep: 'tasks', status: 'implementing' });
        const actions = getFooterActions(
            ctx,
            'tasks',
            workflowSteps,
            { tasks: started() },
        );

        expect(actions.map(a => a.id)).not.toContain('skip');
        expect(actions.map(a => a.id)).not.toContain('unskip');
    });
});
