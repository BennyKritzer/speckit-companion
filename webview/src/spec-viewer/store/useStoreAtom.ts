import { useEffect, useState } from 'preact/hooks';
import type { Atom } from 'jotai/vanilla';
import { specViewerStore } from './store';

export function useStoreAtomValue<Value>(atom: Atom<Value>): Value {
    const [value, setValue] = useState(() => specViewerStore.get(atom));

    useEffect(() => {
        setValue(specViewerStore.get(atom));
        return specViewerStore.sub(atom, () => {
            setValue(specViewerStore.get(atom));
        });
    }, [atom]);

    return value;
}