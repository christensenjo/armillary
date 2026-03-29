import { useMemo, useSyncExternalStore } from 'react';

import {
    buildArmillarySvgString,
    mergeArmillaryConfig,
    mergeArmillaryThemeAppearance,
} from '@/lib/armillaryHeerichScene';
import type { ArmillaryHeerichConfig } from '@/lib/armillaryHeerichScene';

function subscribeDocumentDarkClass(cb: () => void): () => void {
    const el = document.documentElement;
    const mo = new MutationObserver(cb);

    mo.observe(el, { attributes: true, attributeFilter: ['class'] });

    return () => mo.disconnect();
}

function snapshotDocumentDark(): boolean {
    return document.documentElement.classList.contains('dark');
}

function injectSvgPresentationClass(svg: string, className: string): string {
    return svg.replace('<svg ', `<svg class="${className}" fill="none" `);
}

type ArmillarySphereProps = {
    config?: Partial<ArmillaryHeerichConfig>;
};

export function ArmillarySphere({ config }: ArmillarySphereProps) {
    const isDark = useSyncExternalStore(
        subscribeDocumentDarkClass,
        snapshotDocumentDark,
        () => false,
    );

    const merged = useMemo(() => mergeArmillaryConfig(config), [config]);
    const themed = useMemo(
        () => mergeArmillaryThemeAppearance(merged, isDark),
        [merged, isDark],
    );
    const svgHtml = useMemo(() => buildArmillarySvgString(themed), [themed]);

    const html = useMemo(
        () =>
            injectSvgPresentationClass(
                svgHtml,
                'w-full max-w-full pointer-events-none text-foreground [vector-effect:non-scaling-stroke]',
            ),
        [svgHtml],
    );

    return (
        <div
            className="w-[min(92vw,28rem)] max-w-full touch-pan-y select-none"
            role="img"
            aria-label="Armillary sphere — voxel illustration of nested celestial rings"
        >
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    );
}
