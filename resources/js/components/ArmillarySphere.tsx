import { motion, useReducedMotion } from 'motion/react';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import {
    buildArmillarySvgString,
    mergeArmillaryConfig,
    mergeArmillaryThemeAppearance,
} from '@/lib/armillaryHeerichScene';
import type {
    ArmillaryHeerichConfig,
    ArmillaryHeerichDarkAppearance,
} from '@/lib/armillaryHeerichScene';
import {
    applyArmillaryMotionOffsets,
    composedMotionChannelsNear,
    entranceOffsetFactor,
    mergeArmillaryMotionRig,
    motionOffsetsNear,
    ZERO_MOTION_OFFSETS,
} from '@/lib/armillaryMotionRig';
import type {
    ArmillaryMotionFrameOffsets,
    ArmillaryMotionRigConfig,
} from '@/lib/armillaryMotionRig';
import { snapshotDocumentDark, subscribeDocumentDarkClass } from '@/lib/theme';

function injectSvgPresentationClass(svg: string, className: string): string {
    return svg.replace('<svg ', `<svg class="${className}" fill="none" `);
}

const HOVER_MEDIA = '(hover: hover) and (pointer: fine)';

function subscribeHoverCapable(callback: () => void) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    const mq = window.matchMedia(HOVER_MEDIA);

    mq.addEventListener('change', callback);

    return () => mq.removeEventListener('change', callback);
}

function snapshotHoverCapable() {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia(HOVER_MEDIA).matches;
}

type PointerSample = { x: number; y: number; t: number };

type ArmillarySphereProps = {
    config?: Partial<ArmillaryHeerichConfig>;
    darkAppearance?: ArmillaryHeerichDarkAppearance;
    motionRig?: Partial<ArmillaryMotionRigConfig>;
    interactionEnabled?: boolean;
};

export function ArmillarySphere({
    config,
    darkAppearance,
    motionRig: motionRigPartial,
    interactionEnabled = true,
}: ArmillarySphereProps) {
    const isDark = useSyncExternalStore(
        subscribeDocumentDarkClass,
        snapshotDocumentDark,
        () => false,
    );
    const reduceMotion = useReducedMotion() ?? false;
    const canHover = useSyncExternalStore(
        subscribeHoverCapable,
        snapshotHoverCapable,
        () => false,
    );

    const merged = useMemo(() => mergeArmillaryConfig(config), [config]);
    const themed = useMemo(
        () => mergeArmillaryThemeAppearance(merged, isDark, darkAppearance),
        [merged, isDark, darkAppearance],
    );

    const rig = useMemo(
        () => mergeArmillaryMotionRig(motionRigPartial),
        [motionRigPartial],
    );

    const rootRef = useRef<HTMLDivElement>(null);
    const rigRef = useRef(rig);
    const themedRef = useRef(themed);

    useLayoutEffect(() => {
        rigRef.current = rig;
    }, [rig]);

    useLayoutEffect(() => {
        themedRef.current = themed;
    }, [themed]);

    const dragAccumRef = useRef({ ...ZERO_MOTION_OFFSETS });
    const hoverTargetRef = useRef({ x: 0, y: 0 });
    const hoverSmoothedRef = useRef({ x: 0, y: 0 });
    const velRef = useRef({ x: 0, y: 0 });
    const draggingRef = useRef(false);
    const dragPointerIdRef = useRef<number | null>(null);
    const lastPointerRef = useRef<PointerSample | null>(null);
    const pointerSamplesRef = useRef<PointerSample[]>([]);
    const entranceStartedAtRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastTickRef = useRef<number | null>(null);
    const lastBuildWallMsRef = useRef(0);
    const lastPublishedOffsetsRef = useRef<ArmillaryMotionFrameOffsets>({
        ...ZERO_MOTION_OFFSETS,
    });

    const [liveOffsets, setLiveOffsets] = useState<ArmillaryMotionFrameOffsets>(
        () => ({ ...ZERO_MOTION_OFFSETS }),
    );

    const publishOffsets = useCallback((next: ArmillaryMotionFrameOffsets) => {
        setLiveOffsets((prev) =>
            motionOffsetsNear(prev, next, rigRef.current.performance.epsilon)
                ? prev
                : { ...next },
        );
    }, []);

    const stopRaf = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        lastTickRef.current = null;
    }, []);

    const tickRef = useRef<(now: number) => void>(() => {});

    tickRef.current = (now: number) => {
        rafRef.current = null;
        const currentRig = rigRef.current;
        const base = themedRef.current;
        const eps = currentRig.performance.epsilon;
        const minFrame = currentRig.performance.minFrameMs;

        const lastTick = lastTickRef.current ?? now;
        let dt = (now - lastTick) / 1000;

        if (dt > 0.1) {
            dt = 0.1;
        }

        lastTickRef.current = now;

        const dtMs = dt * 1000;

        const entrance = { ...ZERO_MOTION_OFFSETS };

        if (
            interactionEnabled &&
            !reduceMotion &&
            currentRig.entrance.enabled &&
            entranceStartedAtRef.current !== null
        ) {
            const elapsed = now - entranceStartedAtRef.current;
            const f = entranceOffsetFactor(
                elapsed,
                currentRig.entrance.durationMs,
                currentRig.entrance.ease,
            );

            entrance.instrumentYawDeg =
                currentRig.entrance.initialYawOffsetDeg * f;
            entrance.eclipticPhaseDeg =
                currentRig.entrance.initialEclipticOffsetDeg * f;
            entrance.cameraAngle =
                currentRig.entrance.initialCameraAngleOffsetDeg * f;
        }

        const hover = { ...ZERO_MOTION_OFFSETS };

        if (
            interactionEnabled &&
            canHover &&
            currentRig.hover.enabled &&
            !reduceMotion &&
            !draggingRef.current
        ) {
            const k =
                1 - Math.exp(-dt * Math.max(0.01, currentRig.hover.smoothing));

            hoverSmoothedRef.current.x +=
                (hoverTargetRef.current.x - hoverSmoothedRef.current.x) * k;
            hoverSmoothedRef.current.y +=
                (hoverTargetRef.current.y - hoverSmoothedRef.current.y) * k;

            const sx = hoverSmoothedRef.current.x;
            const sy = hoverSmoothedRef.current.y;

            hover.cameraAngle = sx * currentRig.hover.maxCameraDeg;
            hover.instrumentYawDeg = sx * currentRig.hover.maxYawDeg;
            hover.eclipticPhaseDeg = sx * currentRig.hover.maxEclipticDeg;
            hover.polarAxisTiltDeg = sy * currentRig.hover.maxPolarTiltDeg;
        }

        if (!draggingRef.current) {
            const vx = velRef.current.x;
            const vy = velRef.current.y;
            const gain = currentRig.drag.velocityGain;
            const yawS = currentRig.drag.yawSensitivity;
            const camMix = currentRig.drag.cameraMix;
            const eMix = currentRig.drag.eclipticMix;
            const friction = currentRig.drag.friction;
            const maxTilt = currentRig.drag.maxTiltOffsetDeg;
            const tiltPerPx = currentRig.drag.polarAxisTiltPerPx;

            if (Math.abs(vx) > 1e-5 || Math.abs(vy) > 1e-5) {
                const dx = vx * dtMs;
                const dy = vy * dtMs;

                dragAccumRef.current.instrumentYawDeg +=
                    dx * yawS * (1 - camMix) * gain;
                dragAccumRef.current.cameraAngle += dx * yawS * camMix * gain;
                dragAccumRef.current.eclipticPhaseDeg +=
                    dx * yawS * eMix * gain;
                dragAccumRef.current.polarAxisTiltDeg += dy * tiltPerPx * gain;
            }

            velRef.current.x *= friction;
            velRef.current.y *= friction;

            if (Math.abs(velRef.current.x) < 0.0005) {
                velRef.current.x = 0;
            }

            if (Math.abs(velRef.current.y) < 0.0005) {
                velRef.current.y = 0;
            }

            const tilt = dragAccumRef.current.polarAxisTiltDeg;

            if (tilt > maxTilt) {
                dragAccumRef.current.polarAxisTiltDeg = maxTilt;
                velRef.current.y *= 0.5;
            } else if (tilt < -maxTilt) {
                dragAccumRef.current.polarAxisTiltDeg = -maxTilt;
                velRef.current.y *= 0.5;
            }
        }

        const total: ArmillaryMotionFrameOffsets = {
            instrumentYawDeg:
                entrance.instrumentYawDeg +
                hover.instrumentYawDeg +
                dragAccumRef.current.instrumentYawDeg,
            eclipticPhaseDeg:
                entrance.eclipticPhaseDeg +
                hover.eclipticPhaseDeg +
                dragAccumRef.current.eclipticPhaseDeg,
            polarAxisTiltDeg:
                entrance.polarAxisTiltDeg +
                hover.polarAxisTiltDeg +
                dragAccumRef.current.polarAxisTiltDeg,
            cameraAngle:
                entrance.cameraAngle +
                hover.cameraAngle +
                dragAccumRef.current.cameraAngle,
            cameraDistance:
                entrance.cameraDistance +
                hover.cameraDistance +
                dragAccumRef.current.cameraDistance,
        };

        const elapsedEntrance =
            entranceStartedAtRef.current !== null
                ? now - entranceStartedAtRef.current
                : Infinity;
        const entranceComplete =
            !currentRig.entrance.enabled ||
            reduceMotion ||
            elapsedEntrance >= currentRig.entrance.durationMs;

        const hoverSettling =
            canHover &&
            currentRig.hover.enabled &&
            !reduceMotion &&
            !draggingRef.current &&
            (Math.abs(hoverTargetRef.current.x - hoverSmoothedRef.current.x) >
                0.015 ||
                Math.abs(
                    hoverTargetRef.current.y - hoverSmoothedRef.current.y,
                ) > 0.015);

        const motionAlive =
            !entranceComplete ||
            draggingRef.current ||
            Math.abs(velRef.current.x) > 1.5e-3 ||
            Math.abs(velRef.current.y) > 1.5e-3 ||
            hoverSettling;

        const changed = !composedMotionChannelsNear(
            base,
            lastPublishedOffsetsRef.current,
            total,
            eps,
        );

        const wall = performance.now();
        const throttleOk =
            wall - lastBuildWallMsRef.current >= minFrame ||
            draggingRef.current;

        if (changed && throttleOk) {
            lastBuildWallMsRef.current = wall;
            lastPublishedOffsetsRef.current = total;
            publishOffsets(total);
        }

        if (motionAlive) {
            rafRef.current = requestAnimationFrame((t) => tickRef.current(t));
        }
    };

    const kickRaf = useCallback(() => {
        if (!interactionEnabled) {
            return;
        }

        if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame((t) => tickRef.current(t));
        }
    }, [interactionEnabled]);

    useLayoutEffect(() => {
        if (!interactionEnabled) {
            stopRaf();

            return;
        }

        if (reduceMotion) {
            entranceStartedAtRef.current = null;
        } else if (
            rig.entrance.enabled &&
            entranceStartedAtRef.current === null
        ) {
            entranceStartedAtRef.current = performance.now();
        }

        kickRaf();

        return () => {
            stopRaf();
        };
    }, [
        interactionEnabled,
        kickRaf,
        reduceMotion,
        rig.entrance.enabled,
        stopRaf,
    ]);

    const updateHoverFromEvent = useCallback(
        (clientX: number, clientY: number) => {
            const el = rootRef.current;

            if (!el) {
                return;
            }

            const r = el.getBoundingClientRect();

            if (r.width < 1 || r.height < 1) {
                return;
            }

            const nx = ((clientX - r.left) / r.width) * 2 - 1;
            const ny = ((clientY - r.top) / r.height) * 2 - 1;

            hoverTargetRef.current = {
                x: Math.max(-1, Math.min(1, nx)),
                y: Math.max(-1, Math.min(1, ny)),
            };
            kickRaf();
        },
        [kickRaf],
    );

    const onPointerEnter = useCallback(
        (e: ReactPointerEvent<HTMLDivElement>) => {
            if (!interactionEnabled || !canHover || reduceMotion) {
                return;
            }

            updateHoverFromEvent(e.clientX, e.clientY);
        },
        [canHover, interactionEnabled, reduceMotion, updateHoverFromEvent],
    );

    const onPointerMove = useCallback(
        (e: ReactPointerEvent<HTMLDivElement>) => {
            if (!interactionEnabled) {
                return;
            }

            if (draggingRef.current) {
                if (dragPointerIdRef.current !== e.pointerId) {
                    return;
                }

                const last = lastPointerRef.current;

                if (last) {
                    const dx = e.clientX - last.x;
                    const dy = e.clientY - last.y;
                    const currentRig = rigRef.current;
                    const yawS = currentRig.drag.yawSensitivity;
                    const camMix = currentRig.drag.cameraMix;
                    const eMix = currentRig.drag.eclipticMix;
                    const tiltPerPx = currentRig.drag.polarAxisTiltPerPx;
                    const maxTilt = currentRig.drag.maxTiltOffsetDeg;

                    dragAccumRef.current.instrumentYawDeg +=
                        dx * yawS * (1 - camMix);
                    dragAccumRef.current.cameraAngle += dx * yawS * camMix;
                    dragAccumRef.current.eclipticPhaseDeg += dx * yawS * eMix;

                    let nextTilt =
                        dragAccumRef.current.polarAxisTiltDeg + dy * tiltPerPx;

                    if (nextTilt > maxTilt) {
                        nextTilt = maxTilt;
                    } else if (nextTilt < -maxTilt) {
                        nextTilt = -maxTilt;
                    }

                    dragAccumRef.current.polarAxisTiltDeg = nextTilt;
                }

                const t = performance.now();

                lastPointerRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    t,
                };
                pointerSamplesRef.current.push(lastPointerRef.current);
                pointerSamplesRef.current = pointerSamplesRef.current.slice(-8);
                kickRaf();

                return;
            }

            if (canHover && !reduceMotion) {
                updateHoverFromEvent(e.clientX, e.clientY);
            }
        },
        [
            canHover,
            interactionEnabled,
            reduceMotion,
            kickRaf,
            updateHoverFromEvent,
        ],
    );

    const endDrag = useCallback(
        (e: ReactPointerEvent<HTMLDivElement>) => {
            if (dragPointerIdRef.current !== e.pointerId) {
                return;
            }

            draggingRef.current = false;
            dragPointerIdRef.current = null;

            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }

            const samples = pointerSamplesRef.current;

            if (samples.length >= 2) {
                const b = samples[samples.length - 1]!;
                const a = samples[samples.length - 2]!;
                const dt = Math.max(1, b.t - a.t);

                velRef.current.x = (b.x - a.x) / dt;
                velRef.current.y = (b.y - a.y) / dt;
            } else {
                velRef.current.x = 0;
                velRef.current.y = 0;
            }

            pointerSamplesRef.current = [];
            lastPointerRef.current = null;
            kickRaf();
        },
        [kickRaf],
    );

    const onPointerDown = useCallback(
        (e: ReactPointerEvent<HTMLDivElement>) => {
            if (!interactionEnabled || e.button !== 0) {
                return;
            }

            if (draggingRef.current) {
                return;
            }

            draggingRef.current = true;
            dragPointerIdRef.current = e.pointerId;
            velRef.current.x = 0;
            velRef.current.y = 0;
            pointerSamplesRef.current = [];
            lastPointerRef.current = {
                x: e.clientX,
                y: e.clientY,
                t: performance.now(),
            };
            pointerSamplesRef.current.push(lastPointerRef.current);
            e.currentTarget.setPointerCapture(e.pointerId);
            kickRaf();
        },
        [interactionEnabled, kickRaf],
    );

    const onPointerLeave = useCallback(() => {
        if (!interactionEnabled) {
            return;
        }

        hoverTargetRef.current = { x: 0, y: 0 };
        kickRaf();
    }, [interactionEnabled, kickRaf]);

    useEffect(() => {
        if (!interactionEnabled || reduceMotion) {
            return;
        }

        kickRaf();
    }, [interactionEnabled, kickRaf, reduceMotion, themed]);

    const composedConfig = useMemo(
        () => applyArmillaryMotionOffsets(themed, liveOffsets),
        [themed, liveOffsets],
    );

    const svgHtml = useMemo(
        () => buildArmillarySvgString(composedConfig),
        [composedConfig],
    );

    const html = useMemo(
        () =>
            injectSvgPresentationClass(
                svgHtml,
                'w-full max-w-full pointer-events-none text-foreground [vector-effect:non-scaling-stroke]',
            ),
        [svgHtml],
    );

    const ariaLabel = interactionEnabled
        ? 'Interactive armillary sphere — drag to rotate the instrument'
        : 'Armillary sphere — voxel illustration of nested celestial rings';

    if (!interactionEnabled) {
        return (
            <div
                className="w-[min(92vw,28rem)] max-w-full touch-manipulation select-none"
                role="img"
                aria-label={ariaLabel}
            >
                <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        );
    }

    return (
        <motion.div
            ref={rootRef}
            className="w-[min(92vw,28rem)] max-w-full cursor-grab touch-manipulation select-none active:cursor-grabbing motion-reduce:cursor-default motion-reduce:active:cursor-default"
            initial={reduceMotion ? false : { opacity: 0.96 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: reduceMotion ? 0 : 0.38,
                ease: [0.23, 1, 0.32, 1],
            }}
            role="img"
            aria-label={ariaLabel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
        >
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </motion.div>
    );
}
