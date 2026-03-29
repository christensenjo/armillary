import { useCallback, useId, useState } from 'react';

import {
    DEFAULT_ARMILLARY_HEERICH_CONFIG,
    formatArmillaryConfigForPaste,
} from '@/lib/armillaryHeerichScene';
import type { ArmillaryHeerichConfig } from '@/lib/armillaryHeerichScene';

type SliderSpec = {
    key: keyof ArmillaryHeerichConfig;
    label: string;
    min: number;
    max: number;
    step: number;
};

const COLOR_KEYS = [
    { key: 'globeFill' as const, label: 'Globe fill' },
    { key: 'globeStroke' as const, label: 'Globe stroke' },
    { key: 'meridianRingFill' as const, label: 'Meridian ring fill' },
    { key: 'meridianRingStroke' as const, label: 'Meridian ring stroke' },
    { key: 'equatorRingFill' as const, label: 'Equator ring fill' },
    { key: 'equatorRingStroke' as const, label: 'Equator ring stroke' },
    { key: 'eclipticRingFill' as const, label: 'Ecliptic ring fill' },
    { key: 'eclipticRingStroke' as const, label: 'Ecliptic ring stroke' },
    { key: 'axisFill' as const, label: 'Axis fill' },
    { key: 'axisStroke' as const, label: 'Axis stroke' },
];

const SLIDERS: SliderSpec[] = [
    {
        key: 'polarAxisTiltDeg',
        label: 'Polar axis tilt',
        min: -45,
        max: 45,
        step: 0.5,
    },
    {
        key: 'obliquityDeg',
        label: 'Ecliptic obliquity',
        min: 0,
        max: 45,
        step: 0.25,
    },
    {
        key: 'instrumentYawDeg',
        label: 'Instrument yaw (Y)',
        min: -180,
        max: 180,
        step: 1,
    },
    {
        key: 'eclipticPhaseDeg',
        label: 'Ecliptic phase (polar)',
        min: -180,
        max: 180,
        step: 1,
    },
    { key: 'cameraAngle', label: 'Camera angle', min: 0, max: 360, step: 1 },
    {
        key: 'cameraDistance',
        label: 'Camera distance',
        min: 4,
        max: 40,
        step: 0.5,
    },
    { key: 'tile', label: 'Voxel tile (px)', min: 8, max: 40, step: 1 },
    { key: 'rGlobe', label: 'Globe radius', min: 2, max: 8, step: 0.05 },
    { key: 'rEq', label: 'Equator major R', min: 4, max: 14, step: 0.05 },
    { key: 'rEcl', label: 'Ecliptic major R', min: 4, max: 14, step: 0.05 },
    { key: 'rMer', label: 'Meridian major R', min: 4, max: 15, step: 0.05 },
    { key: 'tubeEq', label: 'Equator tube', min: 0.2, max: 1.2, step: 0.02 },
    { key: 'tubeEcl', label: 'Ecliptic tube', min: 0.2, max: 1.2, step: 0.02 },
    { key: 'tubeMer', label: 'Meridian tube', min: 0.2, max: 1.2, step: 0.02 },
    {
        key: 'axisExtentBeyondGlobe',
        label: 'Axis past globe',
        min: 2,
        max: 12,
        step: 0.1,
    },
    {
        key: 'polarAxisRadius',
        label: 'Axis rod thickness',
        min: 0.2,
        max: 1.5,
        step: 0.05,
    },
    { key: 'toSvgPadding', label: 'SVG padding', min: 0, max: 48, step: 1 },
    {
        key: 'ringStrokeWidth',
        label: 'Ring stroke width',
        min: 0.1,
        max: 1.2,
        step: 0.05,
    },
    {
        key: 'globeStrokeWidth',
        label: 'Globe stroke width',
        min: 0.1,
        max: 1.2,
        step: 0.05,
    },
];

/** Value for `<input type="color">` when `css` is not a hex color. */
function colorInputFallback(css: string): string {
    const t = css.trim();
    const m6 = /^#([0-9a-f]{6})$/i.exec(t);

    if (m6) {
        return `#${m6[1]!.toLowerCase()}`;
    }

    const m3 = /^#([0-9a-f]{3})$/i.exec(t);

    if (m3) {
        const [a, b, c] = m3[1]!.split('');

        return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
    }

    return '#6b5b45';
}

type ArmillaryHeerichDevDashboardProps = {
    value: ArmillaryHeerichConfig;
    onChange: (next: ArmillaryHeerichConfig) => void;
};

export function ArmillaryHeerichDevDashboard({
    value,
    onChange,
}: ArmillaryHeerichDevDashboardProps) {
    const baseId = useId();
    const [copied, setCopied] = useState(false);
    const [panelOpen, setPanelOpen] = useState(true);

    const setNumberField = useCallback(
        (key: keyof ArmillaryHeerichConfig, n: number) => {
            onChange({ ...value, [key]: n });
        },
        [onChange, value],
    );

    const setStringField = useCallback(
        (key: keyof ArmillaryHeerichConfig, s: string) => {
            onChange({ ...value, [key]: s });
        },
        [onChange, value],
    );

    const reset = useCallback(() => {
        onChange({ ...DEFAULT_ARMILLARY_HEERICH_CONFIG });
    }, [onChange]);

    const copy = useCallback(async () => {
        const text = formatArmillaryConfigForPaste(value);

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }, [value]);

    const applyColorPreset = useCallback(
        (patch: Partial<ArmillaryHeerichConfig>) => {
            onChange({ ...value, ...patch });
        },
        [onChange, value],
    );

    if (!panelOpen) {
        return (
            <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="fixed top-1/2 left-3 z-30 -translate-y-1/2 rounded-r-lg border border-border bg-card/95 px-2 py-3 font-ui text-xs font-medium text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-muted/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:left-4"
                aria-expanded={false}
                aria-controls={`${baseId}-panel`}
                aria-label="Show armillary development panel"
            >
                Armillary
                <span className="block text-[0.65rem] font-normal text-muted-foreground">
                    dev
                </span>
            </button>
        );
    }

    return (
        <>
            <aside
                id={`${baseId}-panel`}
                className="max-h-[min(85dvh,40rem)] w-full max-w-[min(100%,22rem)] shrink-0 overflow-y-auto overscroll-contain rounded-lg border border-border bg-card/90 p-4 text-card-foreground shadow-sm backdrop-blur-sm sm:max-w-[22rem]"
                aria-label="Armillary sphere development controls"
            >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-ui text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Armillary (dev)
                    </h2>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setPanelOpen(false)}
                            className="rounded-md border border-border bg-background px-2 py-1 font-ui text-xs text-foreground transition-colors hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            aria-label="Hide development panel"
                        >
                            Hide
                        </button>
                        <button
                            type="button"
                            onClick={reset}
                            className="rounded-md border border-border bg-background px-2 py-1 font-ui text-xs text-foreground transition-colors hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <section className="mb-4 space-y-2 border-b border-border pb-4">
                    <h3 className="font-ui text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                        Colors
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            type="button"
                            onClick={() =>
                                applyColorPreset({
                                    meridianRingFill: 'currentColor',
                                    meridianRingStroke: 'currentColor',
                                    equatorRingFill: 'currentColor',
                                    equatorRingStroke: 'currentColor',
                                    eclipticRingFill: 'currentColor',
                                    eclipticRingStroke: 'currentColor',
                                    axisFill: 'currentColor',
                                    axisStroke: 'currentColor',
                                })
                            }
                            className="rounded border border-border bg-background px-2 py-1 font-ui text-[0.65rem] text-foreground hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            Rings & axis → text
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                applyColorPreset({
                                    globeFill: 'hsl(38 32% 47%)',
                                    globeStroke: 'currentColor',
                                })
                            }
                            className="rounded border border-border bg-background px-2 py-1 font-ui text-[0.65rem] text-foreground hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            Globe brass
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                applyColorPreset({
                                    globeFill: '#c9a227',
                                    globeStroke: '#3d3208',
                                    meridianRingFill: '#b8860b',
                                    meridianRingStroke: '#4a3c0a',
                                    equatorRingFill: '#b8860b',
                                    equatorRingStroke: '#4a3c0a',
                                    eclipticRingFill: '#b8860b',
                                    eclipticRingStroke: '#4a3c0a',
                                    axisFill: '#8b6914',
                                    axisStroke: '#2a2206',
                                })
                            }
                            className="rounded border border-border bg-background px-2 py-1 font-ui text-[0.65rem] text-foreground hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            Antique gold
                        </button>
                    </div>
                    {COLOR_KEYS.map(({ key, label }) => {
                        const id = `${baseId}-color-${key}`;
                        const v = value[key];

                        return (
                            <div key={key} className="flex items-center gap-2">
                                <label
                                    htmlFor={`${id}-text`}
                                    className="w-24 shrink-0 font-ui text-[0.7rem] text-foreground"
                                >
                                    {label}
                                </label>
                                <input
                                    id={`${id}-text`}
                                    type="text"
                                    value={v}
                                    onChange={(e) =>
                                        setStringField(key, e.target.value)
                                    }
                                    spellCheck={false}
                                    className="min-w-0 flex-1 rounded border border-border bg-background px-1.5 py-1 font-mono text-[0.65rem] text-foreground"
                                />
                                <input
                                    id={`${id}-picker`}
                                    type="color"
                                    value={colorInputFallback(v)}
                                    onChange={(e) =>
                                        setStringField(key, e.target.value)
                                    }
                                    className="h-8 w-9 shrink-0 cursor-pointer rounded border border-border bg-background p-0"
                                    aria-label={`${label} — hex picker`}
                                />
                            </div>
                        );
                    })}
                </section>

                <div className="space-y-3">
                    {SLIDERS.map((spec) => {
                        const id = `${baseId}-${spec.key}`;
                        const v = value[spec.key] as number;

                        return (
                            <div key={spec.key} className="space-y-1">
                                <div className="flex justify-between gap-2 font-ui text-xs">
                                    <label
                                        htmlFor={id}
                                        className="text-foreground"
                                    >
                                        {spec.label}
                                    </label>
                                    <span className="text-muted-foreground tabular-nums">
                                        {v}
                                    </span>
                                </div>
                                <input
                                    id={id}
                                    type="range"
                                    min={spec.min}
                                    max={spec.max}
                                    step={spec.step}
                                    value={v}
                                    onChange={(e) =>
                                        setNumberField(
                                            spec.key,
                                            Number.parseFloat(e.target.value),
                                        )
                                    }
                                    className="h-2 w-full cursor-pointer accent-foreground"
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 border-t border-border pt-3">
                    <button
                        type="button"
                        onClick={copy}
                        className="w-full rounded-md bg-foreground px-3 py-2 font-ui text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
                    >
                        {copied
                            ? 'Copied to clipboard'
                            : 'Copy config (TypeScript)'}
                    </button>
                    <p className="mt-2 font-ui text-[0.65rem] leading-snug text-muted-foreground">
                        Paste into{' '}
                        <code className="rounded bg-muted px-1 py-px text-[0.62rem]">
                            armillaryHeerichScene.ts
                        </code>{' '}
                        and replace{' '}
                        <code className="rounded bg-muted px-1 py-px text-[0.62rem]">
                            DEFAULT_ARMILLARY_HEERICH_CONFIG
                        </code>
                        .
                    </p>
                </div>
            </aside>
        </>
    );
}
