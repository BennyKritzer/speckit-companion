import type { VSCodeApi } from '../types';
import { navStateAtom } from '../store/atoms';
import { useStoreAtomValue } from '../store/useStoreAtom';

declare const vscode: VSCodeApi;

export function StaleBanner() {
    const ns = useStoreAtomValue(navStateAtom);
    if (!ns) return null;

    const currentStaleness = ns.stalenessMap?.[ns.currentDoc];
    if (!currentStaleness?.isStale) return null;

    return (
        <div class="stale-banner" id="stale-banner">
            <span class="stale-banner-message">{currentStaleness.staleReason}</span>
            <button
                class="stale-regen-btn"
                onClick={() => vscode.postMessage({ type: 'regenerate' })}
            >
                Regenerate
            </button>
        </div>
    );
}
