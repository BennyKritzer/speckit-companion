import type { Meta, StoryObj } from '@storybook/preact';
import { SpecHeader } from './SpecHeader';
import { mockNavState } from './__stories__/mockData';
import { setSpecViewerStoryState } from '../store/storyAtoms';

const meta: Meta<typeof SpecHeader> = {
    title: 'Viewer/SpecHeader',
    component: SpecHeader,
    // Reset body[data-spec-status] before every story so a previous status
    // variant doesn't leak into the next one. Status stories below re-apply
    // the attribute via their own decorator.
    decorators: [
        (Story) => {
            document.body.removeAttribute('data-spec-status');
            return <Story />;
        },
    ],
};
export default meta;

type Story = StoryObj<typeof SpecHeader>;

/** Per-story decorator that sets body[data-spec-status] for the duration of the story. */
const withStatus = (status: string) => (Story: any) => {
    document.body.setAttribute('data-spec-status', status);
    return <Story />;
};

export const Full: Story = {
    render: () => {
        setSpecViewerStoryState({ navState: mockNavState({
            badgeText: 'COMPLETED',
            createdDate: 'Apr 4, 2026',
            specContextName: 'Explorer Viewer Fixes',
            branch: 'main',
            docTypeLabel: 'Tasks',
        }) });
        return <SpecHeader />;
    },
};

export const ActiveDraft: Story = {
    render: () => {
        setSpecViewerStoryState({ navState: mockNavState({
            badgeText: 'DRAFT',
            createdDate: 'Apr 6, 2026',
            specContextName: 'New Feature',
            branch: 'feat/new-feature',
            docTypeLabel: 'Spec',
        }) });
        return <SpecHeader />;
    },
};

export const MinimalTitle: Story = {
    render: () => {
        setSpecViewerStoryState({ navState: mockNavState({
            badgeText: null,
            createdDate: null,
            specContextName: 'Minimal Spec',
            branch: null,
            docTypeLabel: 'Spec',
        }) });
        return <SpecHeader />;
    },
};

export const Empty: Story = {
    render: () => {
        setSpecViewerStoryState({ navState: mockNavState({
            badgeText: null,
            createdDate: null,
            specContextName: null,
            branch: null,
        }) });
        return <SpecHeader />;
    },
};

// ── Spec-badge variants driven by body[data-spec-status] ─────
// Each sets the attribute via the `withStatus` decorator so the
// .spec-badge overrides in _content.css (lines 275–297) render.

export const StatusActive: Story = {
    decorators: [withStatus('active')],
    render: () => {
        setSpecViewerStoryState({ navState: mockNavState({
            badgeText: 'ACTIVE',
            specContextName: 'Active Feature',
            docTypeLabel: 'Spec',
        }) });
        return <SpecHeader />;
    },
};

export const StatusCompleted: Story = {
    decorators: [withStatus('completed')],
    render: () => {
        setSpecViewerStoryState({ navState: mockNavState({
            badgeText: 'COMPLETED',
            specContextName: 'Completed Feature',
            docTypeLabel: 'Tasks',
        }) });
        return <SpecHeader />;
    },
};

export const StatusArchived: Story = {
    decorators: [withStatus('archived')],
    render: () => {
        setSpecViewerStoryState({ navState: mockNavState({
            badgeText: 'ARCHIVED',
            specContextName: 'Archived Feature',
            docTypeLabel: 'Spec',
        }) });
        return <SpecHeader />;
    },
};

export const StatusTasksDone: Story = {
    decorators: [withStatus('tasks-done')],
    render: () => {
        setSpecViewerStoryState({ navState: mockNavState({
            badgeText: 'TASKS DONE',
            specContextName: 'All Tasks Complete',
            docTypeLabel: 'Tasks',
        }) });
        return <SpecHeader />;
    },
};

// ── Renamed status labels (spec 094, second pass) ─────────
// These show the friendlier visible labels for status keys
// whose default hyphen-split capitalization isn't great.

export const StatusCreatingTasks: Story = {
    name: 'Creating Tasks',
    decorators: [withStatus('tasking')],
    render: () => {
        setSpecViewerStoryState({
            navState: mockNavState({
            specContextName: 'Tasking In Progress',
            docTypeLabel: 'Tasks',
        }),
            viewerState: {
            status: 'tasking',
            activeStep: 'tasks',
            steps: {},
            pulse: null,
            highlights: [],
            activeSubstep: null,
            footer: [],
            },
        });
        return <SpecHeader />;
    },
};

export const StatusTasksCreated: Story = {
    name: 'Tasks Created',
    decorators: [withStatus('ready-to-implement')],
    render: () => {
        setSpecViewerStoryState({
            navState: mockNavState({
            specContextName: 'Ready For Build',
            docTypeLabel: 'Tasks',
        }),
            viewerState: {
            status: 'ready-to-implement',
            activeStep: 'tasks',
            steps: {},
            pulse: null,
            highlights: [],
            activeSubstep: null,
            footer: [],
            },
        });
        return <SpecHeader />;
    },
};

export const StatusImplemented: Story = {
    name: 'Implemented',
    decorators: [withStatus('implemented')],
    render: () => {
        setSpecViewerStoryState({
            navState: mockNavState({
            specContextName: 'Build Done — Awaiting Approval',
            docTypeLabel: 'Tasks',
        }),
            viewerState: {
            status: 'implemented',
            activeStep: 'implement',
            steps: {},
            pulse: null,
            highlights: [],
            activeSubstep: null,
            footer: [],
            },
        });
        return <SpecHeader />;
    },
};
