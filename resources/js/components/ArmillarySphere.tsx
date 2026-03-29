import { useMemo } from 'react';

import {
    buildArmillarySvgString,
    mergeArmillaryConfig,
} from '@/lib/armillaryHeerichScene';
import type { ArmillaryHeerichConfig } from '@/lib/armillaryHeerichScene';

function injectSvgPresentationClass(svg: string, className: string): string {
    return svg.replace('<svg ', `<svg class="${className}" fill="none" `);
}

type ArmillarySphereProps = {
    config?: Partial<ArmillaryHeerichConfig>;
};

export function ArmillarySphere({ config }: ArmillarySphereProps) {
    const merged = useMemo(() => mergeArmillaryConfig(config), [config]);
    const svgHtml = useMemo(() => buildArmillarySvgString(merged), [merged]);

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
