import type { Meta, StoryObj } from '@storybook/preact';
import { StaleBanner } from './StaleBanner';
import { mockNavState, stalePlan } from './__stories__/mockData';
import { setSpecViewerStoryState } from '../store/storyAtoms';

const meta: Meta<typeof StaleBanner> = {
    title: 'Viewer/StaleBanner',
    component: StaleBanner,
};
export default meta;

type Story = StoryObj<typeof StaleBanner>;

export const Visible: Story = {
    render: () => {
        setSpecViewerStoryState({ navState: mockNavState({ currentDoc: 'plan', stalenessMap: stalePlan }) });
        return <StaleBanner />;
    },
};

export const Hidden: Story = {
    render: () => {
        setSpecViewerStoryState({ navState: mockNavState({ currentDoc: 'spec' }) });
        return <StaleBanner />;
    },
};
