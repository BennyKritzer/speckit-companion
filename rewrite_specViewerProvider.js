const fs = require('fs');

let content = fs.readFileSync('src/features/spec-viewer/specViewerProvider.ts', 'utf8');

// 1. In updateContent (line 642)
content = content.replace(
    /const taskCompletionPercent = calculateTaskCompletion\(\s*tasksContent,\s*CORE_DOCUMENTS\.TASKS,\s*\);/g,
    `let taskCompletionPercent = calculateTaskCompletion(tasksContent, CORE_DOCUMENTS.TASKS);
      if (
        (featureCtx?.status as string) === 'implemented' ||
        (featureCtx?.status as string) === 'finalized' ||
        (featureCtx?.status as string) === SpecStatuses.COMPLETED ||
        derivedStepHistory?.['implement']?.completedAt != null
      ) {
        taskCompletionPercent = 100;
      }`
);

// 2. In sendContentUpdateMessage (starting around line 982)
// We need to move the featureCtx fetch block UP to right above taskCompletionPercent check.
const originalFeatureCtxBlock = `      // Determine spec status for lifecycle buttons. Tolerate transient
      // read failures so a render pass during a concurrent CLI write
      // degrades to "active" rather than crashing the whole update.
      const changeRoot = instance.state.changeRoot;
      let featureCtx: FeatureWorkflowContext | undefined;
      try {
        featureCtx = await getFeatureWorkflow(specDirectory, changeRoot);
      } catch (err) {
        this.outputChannel.appendLine(
          \`[SpecViewer] sendContentUpdateMessage: getFeatureWorkflow failed — \${err instanceof Error ? err.message : String(err)}\`,
        );
      }
`;

content = content.replace(originalFeatureCtxBlock, '');

// Now we insert it right above `let taskCompletionPercent` in sendContentUpdateMessage
content = content.replace(
    /      \/\/ Calculate task completion for tasks doc/,
    `      const changeRoot = instance.state.changeRoot;
      let featureCtx: FeatureWorkflowContext | undefined;
      try {
        featureCtx = await getFeatureWorkflow(specDirectory, changeRoot);
      } catch (err) {
        this.outputChannel.appendLine(
          \`[SpecViewer] sendContentUpdateMessage: getFeatureWorkflow failed — \${err instanceof Error ? err.message : String(err)}\`,
        );
      }

      const derivedStepHistory = featureCtx
        ? deriveStepHistory(
            (featureCtx.history ?? []) as any,
            featureCtx.currentStep as StepName | undefined,
            (featureCtx.status as string) as import("../../core/types/specContext").Status | undefined,
          )
        : {};

      // Calculate task completion for tasks doc`
);

// And we ALSO need to remove the derivedStepHistory fetching down below, which was:
const oldDerivedStepHistoryBlock = `      // Per-step timing is derived from history[] in-memory (the on-disk
      // file no longer carries stepHistory). Compute once and reuse for the
      // notifier, the running-step probe, and the nav bar.
      const derivedStepHistory = featureCtx
        ? deriveStepHistory(
            (featureCtx.history ?? []) as any,
            featureCtx.currentStep as StepName | undefined,
            featureCtx.status as import("../../core/types/specContext").Status | undefined,
          )
        : {};`;
content = content.replace(oldDerivedStepHistoryBlock, `      // Per-step timing already computed above`);

fs.writeFileSync('src/features/spec-viewer/specViewerProvider.ts', content);
