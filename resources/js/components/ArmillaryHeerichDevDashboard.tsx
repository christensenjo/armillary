import {
    useCallback,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { GripVertical } from 'lucide-react';

import {
    ARMILLARY_BRAND_COLOR_SWATCHES,
    ARMILLARY_DARK_APPEARANCE_OVERRIDES,
    ARMILLARY_HEERICH_COLOR_KEYS,
    DEFAULT_ARMILLARY_HEERICH_CONFIG,
    formatArmillaryConfigForPaste,
    formatArmillaryDarkAppearanceForPaste,
} from '@/lib/armillaryHeerichScene';
import type {
    ArmillaryHeerichConfig,
    ArmillaryHeerichDarkAppearance,
} from '@/lib/armillaryHeerichScene';
import { snapshotDocumentDark, subscribeDocumentDarkClass } from '@/lib/theme';

type SliderSpec = {
    key: keyof ArmillaryHeerichConfig;
    label: string;
    min: number;
    max: number;
    step: number;
};

const ARMILLARY_COLOR_LABELS = {
    globeFill: 'Globe fill',
    globeStroke: 'Globe stroke',
    meridianRingFill: 'Meridian ring fill',
    meridianRingStroke: 'Meridian ring stroke',
    equatorRingFill: 'Equator ring fill',
    equatorRingStroke: 'Equator ring stroke',
    eclipticRingFill: 'Ecliptic ring fill',
    eclipticRingStroke: 'Ecliptic ring stroke',
    axisFill: 'Axis fill',
    axisStroke: 'Axis stroke',
} satisfies Record<(typeof ARMILLARY_HEERICH_COLOR_KEYS)[number], string>;

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

const PICKER_HEX_FALLBACK = '#6b5b45';

/** Parses `#rgb` / `#rrggbb` only. */
function parseSolidHexColor(css: string): string | null {
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

    return null;
}

function rgbStringToHex(rgb: string): string | null {
    const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(
        rgb.trim(),
    );

    if (!m) {
        return null;
    }

    const r = Math.round(Number(m[1]));
    const g = Math.round(Number(m[2]));
    const b = Math.round(Number(m[3]));

    if ([r, g, b].some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
        return null;
    }

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Normalizes any CSS color string the canvas accepts into `#rrggbb` when possible. */
function canvasColorToHex(cssColor: string): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const ctx = document.createElement('canvas').getContext('2d');

    if (!ctx) {
        return null;
    }

    try {
        ctx.fillStyle = '#000000';
        ctx.fillStyle = cssColor;
        const out = ctx.fillStyle as string;

        if (typeof out === 'string') {
            if (/^#[0-9a-f]{6}$/i.test(out)) {
                return out.toLowerCase();
            }

            return rgbStringToHex(out);
        }
    } catch {
        return null;
    }

    return null;
}

/**
 * Resolves authored CSS (e.g. `var(--nordic)`, `hsl(...)`, `currentColor`) to a
 * hex string for `<input type="color">`, which only understands `#rrggbb`.
 */
function resolveCssColorToHexForPicker(css: string): string {
    const fromHex = parseSolidHexColor(css);

    if (fromHex) {
        return fromHex;
    }

    const t = css.trim();

    if (!t || typeof document === 'undefined') {
        return PICKER_HEX_FALLBACK;
    }

    try {
        const el = document.createElement('div');

        el.style.cssText =
            'position:absolute;visibility:hidden;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);';

        if (/^currentColor$/i.test(t)) {
            el.style.color = getComputedStyle(document.body).color;
            el.style.backgroundColor = 'currentColor';
        } else {
            el.style.backgroundColor = t;
        }

        document.documentElement.appendChild(el);
        const resolved = getComputedStyle(el).backgroundColor;

        el.remove();

        return (
            rgbStringToHex(resolved) ??
            canvasColorToHex(resolved) ??
            PICKER_HEX_FALLBACK
        );
    } catch {
        return PICKER_HEX_FALLBACK;
    }
}

type ArmillaryHeerichDevDashboardProps = {
    value: ArmillaryHeerichConfig;
    onChange: (next: ArmillaryHeerichConfig) => void;
    darkAppearance: ArmillaryHeerichDarkAppearance;
    onDarkAppearanceChange: (next: ArmillaryHeerichDarkAppearance) => void;
};

export function ArmillaryHeerichDevDashboard({
    value,
    onChange,
    darkAppearance,
    onDarkAppearanceChange,
}: ArmillaryHeerichDevDashboardProps) {
    const baseId = useId();
    const panelRef = useRef<HTMLAsideElement>(null);
    const dragOffsetRef = useRef<{ ox: number; oy: number } | null>(null);
    const hasOpenedOnceRef = useRef(false);

    const [copied, setCopied] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);
    const [panelPosition, setPanelPosition] = useState({
        x: 16,
        y: 120,
    });
    const [canResolveCssColors, setCanResolveCssColors] = useState(false);

    useLayoutEffect(() => {
        setCanResolveCssColors(true);
    }, []);

    const isDark = useSyncExternalStore(
        subscribeDocumentDarkClass,
        snapshotDocumentDark,
        () => false,
    );

    const setNumberField = useCallback(
        (key: keyof ArmillaryHeerichConfig, n: number) => {
            onChange({ ...value, [key]: n });
        },
        [onChange, value],
    );

    const setColorField = useCallback(
        (key: (typeof ARMILLARY_HEERICH_COLOR_KEYS)[number], s: string) => {
            if (isDark) {
                onDarkAppearanceChange({ ...darkAppearance, [key]: s });
            } else {
                onChange({ ...value, [key]: s });
            }
        },
        [darkAppearance, isDark, onChange, onDarkAppearanceChange, value],
    );

    const reset = useCallback(() => {
        onChange({ ...DEFAULT_ARMILLARY_HEERICH_CONFIG });
        onDarkAppearanceChange({
            ...ARMILLARY_DARK_APPEARANCE_OVERRIDES,
        });
    }, [onChange, onDarkAppearanceChange]);

    const copyConfig = useCallback(async () => {
        const text = isDark
            ? formatArmillaryDarkAppearanceForPaste(darkAppearance)
            : formatArmillaryConfigForPaste(value);

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }, [darkAppearance, isDark, value]);

    const resolvedPickerHex = useMemo(() => {
        const src = isDark ? darkAppearance : value;

        return Object.fromEntries(
            ARMILLARY_HEERICH_COLOR_KEYS.map((k) => {
                const raw = src[k];

                return [
                    k,
                    canResolveCssColors
                        ? resolveCssColorToHexForPicker(raw)
                        : (parseSolidHexColor(raw) ?? PICKER_HEX_FALLBACK),
                ];
            }),
        ) as Record<
            (typeof ARMILLARY_HEERICH_COLOR_KEYS)[number],
            string
        >;
    }, [canResolveCssColors, darkAppearance, isDark, value]);

    const clampPanelPosition = useCallback((x: number, y: number) => {
        const panel = panelRef.current;
        const margin = 8;
        const w = panel?.offsetWidth ?? 352;
        const h = panel?.offsetHeight ?? 400;
        const maxX = Math.max(margin, window.innerWidth - w - margin);
        const maxY = Math.max(margin, window.innerHeight - h - margin);

        return {
            x: Math.min(Math.max(margin, x), maxX),
            y: Math.min(Math.max(margin, y), maxY),
        };
    }, []);

    const handleShowPanel = useCallback(() => {
        setPanelOpen(true);
        if (!hasOpenedOnceRef.current && typeof window !== 'undefined') {
            hasOpenedOnceRef.current = true;
            setPanelPosition({
                x: 16,
                y: Math.max(64, window.innerHeight - 500),
            });
        }
    }, []);

    useLayoutEffect(() => {
        if (!panelOpen) {
            return;
        }

        const normalize = () => {
            setPanelPosition((p) => clampPanelPosition(p.x, p.y));
        };

        normalize();
        window.addEventListener('resize', normalize);

        return () => window.removeEventListener('resize', normalize);
    }, [panelOpen, clampPanelPosition]);

    const onDragHandlePointerDown = useCallback(
        (e: ReactPointerEvent<HTMLDivElement>) => {
            if (e.button !== 0) {
                return;
            }

            const panel = panelRef.current;

            if (!panel) {
                return;
            }

            e.preventDefault();
            const r = panel.getBoundingClientRect();

            dragOffsetRef.current = {
                ox: e.clientX - r.left,
                oy: e.clientY - r.top,
            };
            e.currentTarget.setPointerCapture(e.pointerId);
        },
        [],
    );

    const onDragHandlePointerMove = useCallback(
        (e: ReactPointerEvent<HTMLDivElement>) => {
            if (
                dragOffsetRef.current === null ||
                !e.currentTarget.hasPointerCapture(e.pointerId)
            ) {
                return;
            }

            const { ox, oy } = dragOffsetRef.current;
            const next = clampPanelPosition(
                e.clientX - ox,
                e.clientY - oy,
            );

            setPanelPosition(next);
        },
        [clampPanelPosition],
    );

    const onDragHandlePointerUp = useCallback(
        (e: ReactPointerEvent<HTMLDivElement>) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }

            dragOffsetRef.current = null;
        },
        [],
    );

    const themeLabel = isDark ? 'dark' : 'light';

    return (
        <>
            {!panelOpen ? (
                <button
                    type="button"
                    onClick={handleShowPanel}
                    className="fixed z-40 touch-manipulation rounded-lg border border-border bg-card/95 px-3 py-2.5 font-ui text-xs font-medium text-foreground shadow-md backdrop-blur-sm transition-[background-color,color,transform] hover:bg-muted/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-reduce:transition-none dark:border-abyss/40 dark:shadow-black/20"
                    style={{
                        bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
                        left: 'max(1rem, env(safe-area-inset-left, 0px))',
                    }}
                    aria-expanded={false}
                    aria-controls={`${baseId}-panel`}
                    aria-label="Show armillary development panel"
                >
                    Armillary
                    <span className="block text-[0.65rem] font-normal text-muted-foreground">
                        dev
                    </span>
                </button>
            ) : null}

            {panelOpen ? (
                <aside
                    ref={panelRef}
                    id={`${baseId}-panel`}
                    style={{
                        left: panelPosition.x,
                        top: panelPosition.y,
                    }}
                    className="fixed z-50 max-h-[min(85dvh,40rem)] w-[min(100vw-2rem,22rem)] max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-lg border border-border bg-card/95 p-4 text-card-foreground shadow-lg shadow-black/10 backdrop-blur-sm dark:border-abyss/45 dark:bg-card/92 dark:shadow-black/25"
                    aria-label="Armillary sphere development controls"
                >
                    <div
                        className="mb-3 flex cursor-grab touch-none flex-wrap items-center gap-2 active:cursor-grabbing select-none"
                        onPointerDown={onDragHandlePointerDown}
                        onPointerMove={onDragHandlePointerMove}
                        onPointerUp={onDragHandlePointerUp}
                        onPointerCancel={onDragHandlePointerUp}
                        title="Drag to move panel"
                    >
                        <GripVertical
                            className="size-4 shrink-0 text-muted-foreground opacity-70 pointer-events-none"
                            aria-hidden
                            strokeWidth={2}
                        />
                        <h2 className="pointer-events-none min-w-0 flex-1 font-ui text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Armillary (dev)
                        </h2>
                        <div
                            className="ml-auto flex shrink-0 items-center gap-1"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setPanelOpen(false)}
                                className="touch-manipulation rounded-md border border-border bg-background px-2 py-1 font-ui text-xs text-foreground transition-[background-color,color] hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none dark:border-abyss/55"
                                aria-label="Hide development panel"
                            >
                                Hide
                            </button>
                            <button
                                type="button"
                                onClick={reset}
                                className="touch-manipulation rounded-md border border-border bg-background px-2 py-1 font-ui text-xs text-foreground transition-[background-color,color] hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none dark:border-abyss/55"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <section className="mb-4 space-y-2 border-b border-border pb-4 dark:border-abyss/35">
                        <h3 className="font-ui text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase dark:text-pearl-300/95">
                            Colors
                        </h3>
                        <p className="font-ui text-[0.65rem] leading-snug text-muted-foreground dark:text-pearl-400/90">
                        Site is in{' '}
                        <span className="font-medium text-foreground">
                            {themeLabel}
                        </span>{' '}
                        mode — these controls edit{' '}
                        <span className="font-medium text-foreground">
                            {themeLabel}
                        </span>{' '}
                        colors. Use the theme control in the header to switch and
                        tune the other scheme.
                    </p>
                    {ARMILLARY_HEERICH_COLOR_KEYS.map((key) => {
                        const label = ARMILLARY_COLOR_LABELS[key];
                        const id = `${baseId}-color-${key}`;
                        const v = isDark ? darkAppearance[key] : value[key];

                            return (
                                <div key={key} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <label
                                            htmlFor={`${id}-text`}
                                            className="w-24 shrink-0 font-ui text-[0.7rem] text-foreground"
                                        >
                                            {label}
                                        </label>
                                        <input
                                            id={`${id}-text`}
                                            name={`armillary-color-${key}`}
                                            type="text"
                                            value={v}
                                            onChange={(e) =>
                                                setColorField(
                                                    key,
                                                    e.target.value,
                                                )
                                            }
                                            spellCheck={false}
                                            autoComplete="off"
                                            className="min-w-0 flex-1 rounded border border-border bg-background px-1.5 py-1 font-mono text-[0.65rem] text-foreground dark:border-abyss/55"
                                        />
                                        <input
                                            id={`${id}-picker`}
                                            type="color"
                                            value={resolvedPickerHex[key]}
                                            onChange={(e) =>
                                                setColorField(
                                                    key,
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 w-9 shrink-0 cursor-pointer rounded border border-border bg-background p-0 dark:border-abyss/55"
                                            aria-label={`${label} — hex picker (${themeLabel})`}
                                        />
                                    </div>
                                    <div
                                        className="ml-[6.5rem] flex flex-wrap gap-1"
                                        role="group"
                                        aria-label={`${label} — brand colors (${themeLabel})`}
                                    >
                                        {ARMILLARY_BRAND_COLOR_SWATCHES.map(
                                            ({
                                                label: brandLabel,
                                                value: swatch,
                                            }) => (
                                                <button
                                                    key={brandLabel}
                                                    type="button"
                                                    title={brandLabel}
                                                    aria-label={`Set ${label} to ${brandLabel} (${themeLabel})`}
                                                    onClick={() =>
                                                        setColorField(
                                                            key,
                                                            swatch,
                                                        )
                                                    }
                                                    className="size-5 shrink-0 touch-manipulation rounded-full border border-border shadow-sm ring-offset-2 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:scale-100"
                                                    style={{
                                                        backgroundColor:
                                                            swatch,
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>
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
                                                Number.parseFloat(
                                                    e.target.value,
                                                ),
                                            )
                                        }
                                        className="h-2 w-full cursor-pointer accent-foreground dark:accent-mist"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 border-t border-border pt-3 dark:border-abyss/35">
                        <p
                            className="sr-only"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {copied
                                ? `${themeLabel} configuration copied to clipboard.`
                                : ''}
                        </p>
                        <button
                            type="button"
                            onClick={copyConfig}
                            className="w-full touch-manipulation rounded-md bg-foreground px-3 py-2 font-ui text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none disabled:opacity-50 dark:bg-pearl-600 dark:text-lightspeed dark:hover:bg-pearl-500 dark:focus-visible:ring-mist/60"
                        >
                            {copied
                                ? `Copied (${themeLabel})`
                                : `Copy ${themeLabel} config (TypeScript)`}
                        </button>
                        <p className="mt-2 font-ui text-[0.65rem] leading-snug text-muted-foreground dark:text-pearl-400/90">
                            {isDark ? (
                                <>
                                    Replace{' '}
                                    <code className="rounded bg-muted px-1 py-px text-[0.62rem]">
                                        ARMILLARY_DARK_APPEARANCE_OVERRIDES
                                    </code>{' '}
                                    in{' '}
                                    <code className="rounded bg-muted px-1 py-px text-[0.62rem]">
                                        armillaryHeerichScene.ts
                                    </code>
                                    .
                                </>
                            ) : (
                                <>
                                    Replace{' '}
                                    <code className="rounded bg-muted px-1 py-px text-[0.62rem]">
                                        DEFAULT_ARMILLARY_HEERICH_CONFIG
                                    </code>{' '}
                                    in{' '}
                                    <code className="rounded bg-muted px-1 py-px text-[0.62rem]">
                                        armillaryHeerichScene.ts
                                    </code>
                                    .
                                </>
                            )}
                        </p>
                    </div>
                </aside>
            ) : null}
        </>
    );
}
