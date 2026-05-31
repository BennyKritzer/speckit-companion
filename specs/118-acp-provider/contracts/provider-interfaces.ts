// Contract alterations for AIProvider interface

export interface IAIProvider {
    /**
     * Determines whether the provider handles tracking its own execution lifecycle 
     * instead of relying on the generic external terminal tracker in SpecKit.
     * When true, the core extension does not tie Spec step completion to terminal exiting.
     */
    readonly managesOwnLifecycle?: boolean;
    // ...other normal IAIProvider properties
}
