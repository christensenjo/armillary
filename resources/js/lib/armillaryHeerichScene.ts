import { Heerich } from 'heerich';

type Vec3 = [number, number, number];

function normalize3(v: Vec3): Vec3 {
    const L = Math.hypot(v[0], v[1], v[2]);

    if (L === 0) {
        return [0, 0, 0];
    }

    return [v[0] / L, v[1] / L, v[2] / L];
}

function cross3(a: Vec3, b: Vec3): Vec3 {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

/** Rotate vector `v` around unit axis `k` by `rad` (Rodrigues). */
function rotateAroundAxis(v: Vec3, axis: Vec3, rad: number): Vec3 {
    const k = normalize3(axis);

    if (Math.hypot(k[0], k[1], k[2]) === 0) {
        return v;
    }

    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dot = v[0] * k[0] + v[1] * k[1] + v[2] * k[2];
    const cx = cross3(k, v);

    return [
        v[0] * cos + cx[0] * sin + k[0] * dot * (1 - cos),
        v[1] * cos + cx[1] * sin + k[1] * dot * (1 - cos),
        v[2] * cos + cx[2] * sin + k[2] * dot * (1 - cos),
    ];
}

/** Right-handed rotation around +Y (voxel Y increases downward on screen). */
function rotY(v: Vec3, deg: number): Vec3 {
    const rad = (deg * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);

    return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

/** Screen-up in Heerich voxels: smaller Y is toward the top of the screen. */
const SCREEN_UP: Vec3 = [0, -1, 0];

function insideTorus(p: Vec3, w: Vec3, majorR: number, tubeR: number): boolean {
    const [px, py, pz] = p;
    const [wx, wy, wz] = w;
    const t = px * wx + py * wy + pz * wz;
    const bx = px - wx * t;
    const by = py - wy * t;
    const bz = pz - wz * t;
    const radial = Math.hypot(bx, by, bz);
    const d2 = (radial - majorR) ** 2 + t * t;

    return d2 <= tubeR * tubeR;
}

function voxelCenter(x: number, y: number, z: number, center: Vec3): Vec3 {
    return [x + 0.5 - center[0], y + 0.5 - center[1], z + 0.5 - center[2]];
}

function eclipticNormal(equatorialNormal: Vec3, obliquityRad: number): Vec3 {
    const [nx, ny, nz] = equatorialNormal;
    const c = Math.cos(obliquityRad);
    const s = Math.sin(obliquityRad);

    return normalize3([nx, ny * c - nz * s, ny * s + nz * c]);
}

/** Dialable parameters (degrees for angles — converted inside the builder). */
export type ArmillaryHeerichConfig = {
    polarAxisTiltDeg: number;
    obliquityDeg: number;
    /** Spin the whole instrument around +Y through the center (meridian-style yaw). */
    instrumentYawDeg: number;
    /** Rotate the ecliptic plane around the polar axis (solstice / node phase). */
    eclipticPhaseDeg: number;
    cameraAngle: number;
    cameraDistance: number;
    tile: number;
    rGlobe: number;
    rEq: number;
    rEcl: number;
    rMer: number;
    tubeEq: number;
    tubeEcl: number;
    tubeMer: number;
    axisExtentBeyondGlobe: number;
    polarAxisRadius: number;
    toSvgPadding: number;
    ringStrokeWidth: number;
    globeStrokeWidth: number;
    /** CSS colors for Heerich styles (`currentColor`, hex, hsl, etc.). */
    globeFill: string;
    globeStroke: string;
    equatorRingFill: string;
    equatorRingStroke: string;
    eclipticRingFill: string;
    eclipticRingStroke: string;
    meridianRingFill: string;
    meridianRingStroke: string;
    axisFill: string;
    axisStroke: string;
};

/** Keys merged in dark mode (`ARMILLARY_DARK_APPEARANCE_OVERRIDES`). */
export const ARMILLARY_HEERICH_COLOR_KEYS = [
    'globeFill',
    'globeStroke',
    'meridianRingFill',
    'meridianRingStroke',
    'equatorRingFill',
    'equatorRingStroke',
    'eclipticRingFill',
    'eclipticRingStroke',
    'axisFill',
    'axisStroke',
] as const;

/** Dark mode: full color set applied on top of geometry from the light base. */
export type ArmillaryHeerichDarkAppearance = Pick<
    ArmillaryHeerichConfig,
    (typeof ARMILLARY_HEERICH_COLOR_KEYS)[number]
>;

/** Light-mode fills aligned with brand abyss / nordic for theme switching. */
export const ARMILLARY_LIGHT_ECLIPTIC_FILL = '#0C1B15';
export const ARMILLARY_LIGHT_AXIS_FILL = '#1D393C';

export const DEFAULT_ARMILLARY_HEERICH_CONFIG: ArmillaryHeerichConfig = {
    polarAxisTiltDeg: -45,
    obliquityDeg: 35.25,
    instrumentYawDeg: 2,
    eclipticPhaseDeg: 24,
    cameraAngle: 214,
    cameraDistance: 6,
    tile: 33,
    rGlobe: 6.35,
    rEq: 8.1,
    rEcl: 10.4,
    rMer: 13.9,
    tubeEq: 0.68,
    tubeEcl: 0.66,
    tubeMer: 0.66,
    axisExtentBeyondGlobe: 11.4,
    polarAxisRadius: 0.6,
    toSvgPadding: 14,
    ringStrokeWidth: 0.85,
    globeStrokeWidth: 0.85,
    globeFill: '#C5D9E3',
    globeStroke: '#ffffff',
    equatorRingFill: '#A19ABD',
    equatorRingStroke: '#ffffff',
    eclipticRingFill: ARMILLARY_LIGHT_ECLIPTIC_FILL,
    eclipticRingStroke: '#ffffff',
    meridianRingFill: '#B4C4C3',
    meridianRingStroke: '#ffffff',
    axisFill: ARMILLARY_LIGHT_AXIS_FILL,
    axisStroke: '#ffffff',
};

export const ARMILLARY_DARK_APPEARANCE_OVERRIDES: ArmillaryHeerichDarkAppearance =
    {
        globeFill: 'var(--grape)',
        globeStroke: 'var(--abyss)',
        meridianRingFill: 'var(--nordic)',
        meridianRingStroke: 'var(--mist)',
        equatorRingFill: 'var(--mist)',
        equatorRingStroke: 'var(--nordic)',
        eclipticRingFill: 'var(--abyss)',
        eclipticRingStroke: 'var(--grape)',
        axisFill: 'var(--lightspeed)',
        axisStroke: 'var(--abyss)',
    };

/** CSS `var(--token)` values wired in `app.css`; safe for inline SVG fills. */
export const ARMILLARY_BRAND_COLOR_SWATCHES = [
    { label: 'Pearl', value: 'var(--pearl)' },
    { label: 'Nordic', value: 'var(--nordic)' },
    { label: 'Grape', value: 'var(--grape)' },
    { label: 'Abyss', value: 'var(--abyss)' },
    { label: 'Lightspeed', value: 'var(--lightspeed)' },
    { label: 'Mist', value: 'var(--mist)' },
] as const;

/**
 * Dark mode: merge full dark color set (`ARMILLARY_DARK_APPEARANCE_OVERRIDES` or dev preview).
 */
export function mergeArmillaryThemeAppearance(
    config: ArmillaryHeerichConfig,
    isDark: boolean,
    darkAppearance: ArmillaryHeerichDarkAppearance = ARMILLARY_DARK_APPEARANCE_OVERRIDES,
): ArmillaryHeerichConfig {
    if (!isDark) {
        return config;
    }

    return {
        ...config,
        ...darkAppearance,
    };
}

export function mergeArmillaryConfig(
    partial?: Partial<ArmillaryHeerichConfig>,
): ArmillaryHeerichConfig {
    return { ...DEFAULT_ARMILLARY_HEERICH_CONFIG, ...partial };
}

/**
 * TypeScript snippet to paste into `armillaryHeerichScene.ts` (replace
 * `DEFAULT_ARMILLARY_HEERICH_CONFIG`).
 */
export function formatArmillaryConfigForPaste(
    config: ArmillaryHeerichConfig,
): string {
    const lines = [
        "import type { ArmillaryHeerichConfig } from '@/lib/armillaryHeerichScene';",
        '',
        '// Light / base config — replace DEFAULT_ARMILLARY_HEERICH_CONFIG in armillaryHeerichScene.ts',
        'export const DEFAULT_ARMILLARY_HEERICH_CONFIG: ArmillaryHeerichConfig = {',
    ];

    for (const key of Object.keys(DEFAULT_ARMILLARY_HEERICH_CONFIG) as Array<
        keyof ArmillaryHeerichConfig
    >) {
        lines.push(`    ${key}: ${JSON.stringify(config[key])},`);
    }

    lines.push('};', '');

    return lines.join('\n');
}

/**
 * TypeScript snippet for dark-mode color overrides (replace
 * `ARMILLARY_DARK_APPEARANCE_OVERRIDES`).
 */
export function formatArmillaryDarkAppearanceForPaste(
    appearance: ArmillaryHeerichDarkAppearance,
): string {
    const lines = [
        "import type { ArmillaryHeerichDarkAppearance } from '@/lib/armillaryHeerichScene';",
        '',
        '// Dark mode — merged on top of the base config when `.dark` is active',
        '// Replace ARMILLARY_DARK_APPEARANCE_OVERRIDES in armillaryHeerichScene.ts',
        'export const ARMILLARY_DARK_APPEARANCE_OVERRIDES: ArmillaryHeerichDarkAppearance = {',
    ];

    for (const key of ARMILLARY_HEERICH_COLOR_KEYS) {
        lines.push(`    ${key}: ${JSON.stringify(appearance[key])},`);
    }

    lines.push('};', '');

    return lines.join('\n');
}

/**
 * Builds a single centered SVG string for a static voxel armillary (globe, equator, ecliptic, meridian, polar axis).
 */
export function buildArmillarySvgString(
    config: ArmillaryHeerichConfig = DEFAULT_ARMILLARY_HEERICH_CONFIG,
): string {
    const tiltRad = (config.polarAxisTiltDeg * Math.PI) / 180;
    const obliquityRad = (config.obliquityDeg * Math.PI) / 180;
    const phaseRad = (config.eclipticPhaseDeg * Math.PI) / 180;

    const center: Vec3 = [14, 14, 14];
    const BOUNDS: [[number, number, number], [number, number, number]] = [
        [0, 0, 0],
        [28, 28, 28],
    ];

    const polarBase = normalize3([Math.sin(tiltRad), Math.cos(tiltRad), 0]);
    const polarAxis = normalize3(rotY(polarBase, config.instrumentYawDeg));
    const nMeridian = normalize3(cross3(polarAxis, SCREEN_UP));
    let nEcliptic = eclipticNormal(polarAxis, obliquityRad);

    if (Math.abs(config.eclipticPhaseDeg) > 1e-6) {
        nEcliptic = normalize3(
            rotateAroundAxis(nEcliptic, polarAxis, phaseRad),
        );
    }

    const axisExtent = config.rGlobe + config.axisExtentBeyondGlobe;
    const poleA: Vec3 = [
        center[0] - polarAxis[0] * axisExtent,
        center[1] - polarAxis[1] * axisExtent,
        center[2] - polarAxis[2] * axisExtent,
    ];
    const poleB: Vec3 = [
        center[0] + polarAxis[0] * axisExtent,
        center[1] + polarAxis[1] * axisExtent,
        center[2] + polarAxis[2] * axisExtent,
    ];

    const meridianRingStyle = {
        default: {
            fill: config.meridianRingFill,
            stroke: config.meridianRingStroke,
            strokeWidth: config.ringStrokeWidth,
        },
    } as const;

    const equatorRingStyle = {
        default: {
            fill: config.equatorRingFill,
            stroke: config.equatorRingStroke,
            strokeWidth: config.ringStrokeWidth,
        },
    } as const;

    const eclipticRingStyle = {
        default: {
            fill: config.eclipticRingFill,
            stroke: config.eclipticRingStroke,
            strokeWidth: config.ringStrokeWidth,
        },
    } as const;

    const globeStyle = {
        default: {
            fill: config.globeFill,
            stroke: config.globeStroke,
            strokeWidth: config.globeStrokeWidth,
        },
    } as const;

    const axisStyle = {
        default: {
            fill: config.axisFill,
            stroke: config.axisStroke,
            strokeWidth: Math.max(config.ringStrokeWidth, 0.25) + 0.05,
        },
    } as const;

    const engine = new Heerich({
        tile: [config.tile, config.tile],
        camera: {
            type: 'oblique',
            angle: config.cameraAngle,
            distance: config.cameraDistance,
        },
        style: {
            fill: config.equatorRingFill,
            stroke: config.equatorRingStroke,
            strokeWidth: config.ringStrokeWidth,
        },
    });

    const torusTest =
        (axis: Vec3, R: number, tube: number) =>
        (x: number, y: number, z: number) =>
            insideTorus(voxelCenter(x, y, z, center), axis, R, tube);

    engine.addSphere({
        center,
        radius: config.rGlobe,
        style: globeStyle,
    });

    engine.addLine({
        from: [
            Math.round(poleA[0]),
            Math.round(poleA[1]),
            Math.round(poleA[2]),
        ],
        to: [Math.round(poleB[0]), Math.round(poleB[1]), Math.round(poleB[2])],
        radius: config.polarAxisRadius,
        shape: 'rounded',
        style: axisStyle,
    });

    engine.addWhere({
        bounds: BOUNDS,
        test: torusTest(nMeridian, config.rMer, config.tubeMer),
        style: meridianRingStyle,
    });

    engine.addWhere({
        bounds: BOUNDS,
        test: torusTest(polarAxis, config.rEq, config.tubeEq),
        style: equatorRingStyle,
    });

    engine.addWhere({
        bounds: BOUNDS,
        test: torusTest(nEcliptic, config.rEcl, config.tubeEcl),
        style: eclipticRingStyle,
    });

    return engine.toSVG({ padding: config.toSvgPadding });
}
