import type { ArmillaryHeerichConfig } from '@/lib/armillaryHeerichScene';

/** Runtime offsets applied on top of authored `ArmillaryHeerichConfig` (degrees / camera units). */
export type ArmillaryMotionFrameOffsets = {
    instrumentYawDeg: number;
    eclipticPhaseDeg: number;
    polarAxisTiltDeg: number;
    cameraAngle: number;
    cameraDistance: number;
};

export const ZERO_MOTION_OFFSETS: ArmillaryMotionFrameOffsets = {
    instrumentYawDeg: 0,
    eclipticPhaseDeg: 0,
    polarAxisTiltDeg: 0,
    cameraAngle: 0,
    cameraDistance: 0,
};

/** Tunable motion / interaction parameters (dev panel + defaults). */
export type ArmillaryMotionRigConfig = {
    entrance: {
        enabled: boolean;
        durationMs: number;
        /** Extra yaw at start of entrance (deg), decays to 0. */
        initialYawOffsetDeg: number;
        initialEclipticOffsetDeg: number;
        initialCameraAngleOffsetDeg: number;
        /** Cubic-bezier for entrance progress (CSS-like, ease-out default). */
        ease: [number, number, number, number];
    };
    hover: {
        enabled: boolean;
        maxCameraDeg: number;
        maxYawDeg: number;
        maxEclipticDeg: number;
        /** Subtle vertical hover lean (polar axis tilt offset). */
        maxPolarTiltDeg: number;
        /** Lerp rate toward hover target (~1/s). Higher = snappier. */
        smoothing: number;
    };
    drag: {
        /** Degrees of yaw per pixel of horizontal drag. */
        yawSensitivity: number;
        /** 0 = all horizontal motion is yaw; 1 = all goes to camera orbit. */
        cameraMix: number;
        /** Fraction of horizontal motion fed into ecliptic phase (scaled). */
        eclipticMix: number;
        polarAxisTiltPerPx: number;
        /** Velocity decay per frame (0.9–0.98 typical) at ~60fps. */
        friction: number;
        /** Extra scale on release inertia (1 = match drag pixel feel). */
        velocityGain: number;
        /** Soft clamp on tilt offset magnitude (deg). */
        maxTiltOffsetDeg: number;
    };
    performance: {
        /** Minimum ms between Heerich SVG rebuilds (throttle). */
        minFrameMs: number;
        /** Skip rebuild if offset delta is below this (degrees / distance units). */
        epsilon: number;
    };
};

export const DEFAULT_ARMILLARY_MOTION_RIG: ArmillaryMotionRigConfig = {
    entrance: {
        enabled: true,
        durationMs: 720,
        initialYawOffsetDeg: 14,
        initialEclipticOffsetDeg: 6,
        initialCameraAngleOffsetDeg: 10,
        ease: [0.23, 1, 0.32, 1],
    },
    hover: {
        enabled: true,
        maxCameraDeg: 5,
        maxYawDeg: 2.5,
        maxEclipticDeg: 1.25,
        maxPolarTiltDeg: 1.5,
        smoothing: 14,
    },
    drag: {
        yawSensitivity: 0.12,
        cameraMix: 0.35,
        eclipticMix: 0.45,
        polarAxisTiltPerPx: 0.04,
        friction: 0.92,
        velocityGain: 1,
        maxTiltOffsetDeg: 8,
    },
    performance: {
        minFrameMs: 32,
        epsilon: 0.04,
    },
};

export function mergeArmillaryMotionRig(
    partial?: Partial<ArmillaryMotionRigConfig>,
): ArmillaryMotionRigConfig {
    if (!partial) {
        return { ...DEFAULT_ARMILLARY_MOTION_RIG };
    }

    return {
        entrance: {
            ...DEFAULT_ARMILLARY_MOTION_RIG.entrance,
            ...partial.entrance,
        },
        hover: { ...DEFAULT_ARMILLARY_MOTION_RIG.hover, ...partial.hover },
        drag: { ...DEFAULT_ARMILLARY_MOTION_RIG.drag, ...partial.drag },
        performance: {
            ...DEFAULT_ARMILLARY_MOTION_RIG.performance,
            ...partial.performance,
        },
    };
}

function cubicBezierY(
    t: number,
    p1x: number,
    p1y: number,
    p2x: number,
    p2y: number,
): number {
    const cx = 3 * p1x;
    const bx = 3 * (p2x - p1x) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * p1y;
    const by = 3 * (p2y - p1y) - cy;
    const ay = 1 - cy - by;

    const clampedT = Math.min(1, Math.max(0, t));
    let x = clampedT;

    for (let i = 0; i < 8; i++) {
        const xt = ((ax * x + bx) * x + cx) * x - clampedT;

        if (Math.abs(xt) < 1e-4) {
            break;
        }

        const dxt = (3 * ax * x + 2 * bx) * x + cx;

        if (Math.abs(dxt) < 1e-6) {
            break;
        }

        x -= xt / dxt;
    }

    x = Math.min(1, Math.max(0, x));

    return ((ay * x + by) * x + cy) * x;
}

/**
 * Entrance progress 0..1 where 0 = start (full offsets), 1 = settled.
 * elapsedMs since entrance start; returns progress toward 1.
 */
export function entranceProgressAt(
    elapsedMs: number,
    durationMs: number,
    ease: [number, number, number, number],
): number {
    if (durationMs <= 0) {
        return 1;
    }

    const t = Math.min(1, elapsedMs / durationMs);

    return cubicBezierY(t, ease[0], ease[1], ease[2], ease[3]);
}

/** Remaining entrance offset factor in 0..1 (1 at start, 0 when done). */
export function entranceOffsetFactor(
    elapsedMs: number,
    durationMs: number,
    ease: [number, number, number, number],
): number {
    return 1 - entranceProgressAt(elapsedMs, durationMs, ease);
}

function normalizeAngle360(deg: number): number {
    let a = deg % 360;

    if (a < 0) {
        a += 360;
    }

    return a;
}

function anglesNear(a: number, b: number, eps: number): boolean {
    const d = Math.abs(a - b) % 360;

    return Math.min(d, 360 - d) <= eps;
}

/**
 * Returns true if all offset channels changed by less than `epsilon` (and distance).
 */
export function motionOffsetsNear(
    a: ArmillaryMotionFrameOffsets,
    b: ArmillaryMotionFrameOffsets,
    epsilon: number,
): boolean {
    return (
        Math.abs(a.instrumentYawDeg - b.instrumentYawDeg) < epsilon &&
        Math.abs(a.eclipticPhaseDeg - b.eclipticPhaseDeg) < epsilon &&
        Math.abs(a.polarAxisTiltDeg - b.polarAxisTiltDeg) < epsilon &&
        Math.abs(a.cameraAngle - b.cameraAngle) < epsilon &&
        Math.abs(a.cameraDistance - b.cameraDistance) < epsilon
    );
}

/**
 * Additive composition: `base` is the themed merged config from props; offsets come from rig.
 */
export function applyArmillaryMotionOffsets(
    base: ArmillaryHeerichConfig,
    offsets: ArmillaryMotionFrameOffsets,
): ArmillaryHeerichConfig {
    return {
        ...base,
        instrumentYawDeg: base.instrumentYawDeg + offsets.instrumentYawDeg,
        eclipticPhaseDeg: base.eclipticPhaseDeg + offsets.eclipticPhaseDeg,
        polarAxisTiltDeg: base.polarAxisTiltDeg + offsets.polarAxisTiltDeg,
        cameraAngle: normalizeAngle360(base.cameraAngle + offsets.cameraAngle),
        cameraDistance: Math.max(
            4,
            Math.min(40, base.cameraDistance + offsets.cameraDistance),
        ),
    };
}

/**
 * Compare composed snapshot for throttle: uses same fields as `applyArmillaryMotionOffsets`.
 */
export function composedMotionChannelsNear(
    base: ArmillaryHeerichConfig,
    oA: ArmillaryMotionFrameOffsets,
    oB: ArmillaryMotionFrameOffsets,
    epsilon: number,
): boolean {
    const yawA = base.instrumentYawDeg + oA.instrumentYawDeg;
    const yawB = base.instrumentYawDeg + oB.instrumentYawDeg;

    const eclA = base.eclipticPhaseDeg + oA.eclipticPhaseDeg;
    const eclB = base.eclipticPhaseDeg + oB.eclipticPhaseDeg;

    const tiltA = base.polarAxisTiltDeg + oA.polarAxisTiltDeg;
    const tiltB = base.polarAxisTiltDeg + oB.polarAxisTiltDeg;

    const camA = normalizeAngle360(base.cameraAngle + oA.cameraAngle);
    const camB = normalizeAngle360(base.cameraAngle + oB.cameraAngle);

    const distA = base.cameraDistance + oA.cameraDistance;
    const distB = base.cameraDistance + oB.cameraDistance;

    return (
        anglesNear(yawA, yawB, epsilon) &&
        anglesNear(eclA, eclB, epsilon) &&
        Math.abs(tiltA - tiltB) < epsilon &&
        anglesNear(camA, camB, epsilon) &&
        Math.abs(distA - distB) < epsilon
    );
}
