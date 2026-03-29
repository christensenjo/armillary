import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

/**
 * Renders children only after mount (browser). Use for components that rely on
 * DOM APIs, portals, or strict client React resolution during Inertia SSR.
 */
export function ClientOnly({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return <>{children}</>;
}
