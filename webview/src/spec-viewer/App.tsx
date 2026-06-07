import { useRef, useEffect, useState } from 'preact/hooks';
import { NavigationBar } from './components/NavigationBar';
import { StaleBanner } from './components/StaleBanner';
import { SpecHeader } from './components/SpecHeader';
import { FooterActions } from './components/FooterActions';
import { ActivityPanel } from './components/ActivityPanel';
import { ActivityErrorBoundary } from './components/ActivityErrorBoundary';
import { markdownHtmlAtom, navStateAtom, activityVisibleAtom, viewerStateAtom } from './store/atoms';
import { useStoreAtomValue } from './store/useStoreAtom';
import { restoreComments, clearAllRefinements } from './editor';

export interface AppProps {
    specStatus: string;
}

export function App({ specStatus }: AppProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const html = useStoreAtomValue(markdownHtmlAtom);
    const ns = useStoreAtomValue(navStateAtom);
    
    // Automatically force the activity panel visible if the currently viewed document is an actionOnly phase
    const isActionOnlyDoc = ns?.coreDocs.find(d => d.type === ns.currentDoc)?.actionOnly ?? false;
    const showActivity = useStoreAtomValue(activityVisibleAtom) || isActionOnlyDoc;
    
    const reviewComments = useStoreAtomValue(viewerStateAtom)?.reviewComments;
    const [hasMountedActivity, setHasMountedActivity] = useState(false);
    useEffect(() => {
        if (showActivity) setHasMountedActivity(true);
    }, [showActivity]);

    // After Preact sets innerHTML via dangerouslySetInnerHTML,
    // fire a custom event so highlighting/mermaid can run
    useEffect(() => {
        if (html && contentRef.current) {
            contentRef.current.dispatchEvent(new CustomEvent('content-rendered'));
        }
    }, [html]);

    // Restore persisted review comments inline. A doc switch / reload replaces
    // innerHTML, so clear stale in-memory mounts first, then re-anchor. The
    // second effect catches the viewerState that lands after the first paint
    // and any live add/remove/refine updates (restoreComments is idempotent).
    useEffect(() => {
        if (html && contentRef.current) {
            clearAllRefinements();
            restoreComments();
        }
    }, [html]);
    useEffect(() => {
        if (html && contentRef.current) restoreComments();
    }, [reviewComments]);

    // Mirror spec-context presence onto <body> so CSS can hide the first H1
    // even though .spec-header is no longer a sibling of #markdown-content.
    useEffect(() => {
        const has = !!(ns?.specContextName || ns?.badgeText);
        document.body.dataset.hasSpecContext = has ? 'true' : 'false';
    }, [ns?.specContextName, ns?.badgeText]);

    return (
        <>
            <nav class="compact-nav">
                <NavigationBar />
            </nav>
            <StaleBanner />
            <SpecHeader />
            <main class="content-area" id="content-area">
                <div
                    id="markdown-content"
                    ref={contentRef}
                    dangerouslySetInnerHTML={{ __html: html }}
                    hidden={showActivity}
                />
                {hasMountedActivity && (
                    <div hidden={!showActivity}>
                        <ActivityErrorBoundary>
                            <ActivityPanel />
                        </ActivityErrorBoundary>
                    </div>
                )}
                <aside class="spec-toc" id="spec-toc" aria-label="Table of contents" hidden={showActivity}></aside>
            </main>
            <FooterActions initialSpecStatus={specStatus} />
        </>
    );
}
