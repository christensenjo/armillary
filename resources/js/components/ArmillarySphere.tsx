import { useMemo, useSyncExternalStore } from 'react';

import {
    buildArmillarySvgString,
    mergeArmillaryConfig,
    mergeArmillaryThemeAppearance,
} from '@/lib/armillaryHeerichScene';
import type {
    ArmillaryHeerichConfig,
    ArmillaryHeerichDarkAppearance,
} from '@/lib/armillaryHeerichScene';
import { snapshotDocumentDark, subscribeDocumentDarkClass } from '@/lib/theme';

function injectSvgPresentationClass(svg: string, className: string): string {
    return svg.replace('<svg ', `<svg class="${className}" fill="none" `);
}

type ArmillarySphereProps = {
    config?: Partial<ArmillaryHeerichConfig>;
    /** Dev-only: preview dark overrides without editing the bundled constant. */
    darkAppearance?: ArmillaryHeerichDarkAppearance;
};

export function ArmillarySphere({
    config,
    darkAppearance,
}: ArmillarySphereProps) {
    const isDark = useSyncExternalStore(
        subscribeDocumentDarkClass,
        snapshotDocumentDark,
        () => false,
    );

    const merged = useMemo(() => mergeArmillaryConfig(config), [config]);
    const themed = useMemo(
        () => mergeArmillaryThemeAppearance(merged, isDark, darkAppearance),
        [merged, isDark, darkAppearance],
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
            className="w-[min(92vw,28rem)] max-w-full touch-manipulation select-none"
            role="img"
            aria-label="Armillary sphere — voxel illustration of nested celestial rings"
        >
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    );
}
