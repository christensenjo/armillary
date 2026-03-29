import type { CSSProperties, ReactNode } from 'react';
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react';

/** Hub center from reference ellipse (214.06, 138) */
const OX = 214.06;
const OY = 138;

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

/** Much thinner than source (17 / 15 / 12 / 7) — values are in user units (viewBox 427×279). */
const STROKE = {
    ringOuter: 1.5,
    ringMid: 1.1,
    ringInner: 0.75,
    axis: 2,
} as const;

/** rest + burst × engaged for each rotating layer: three skewed rings + axis */
const RING_LAYERS = [
    { rest: 0, burst: 108 },
    { rest: 0, burst: -132 },
    { rest: 0, burst: 122 },
    { rest: 0, burst: -52 },
] as const;

const TAP_BURST_MS = 1400;

function usePrefersReducedMotion(): boolean {
    return useSyncExternalStore(
        (onStoreChange) => {
            const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
            mq.addEventListener('change', onStoreChange);

            return () => mq.removeEventListener('change', onStoreChange);
        },
        () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        () => false,
    );
}

type RotatingLayerProps = {
    angle: number;
    reducedMotion: boolean;
    engaged: boolean;
    index: number;
    baseOpacity: number;
    children: ReactNode;
};

function RotatingLayer({
    angle,
    reducedMotion,
    engaged,
    index,
    baseOpacity,
    children,
}: RotatingLayerProps) {
    const transform = reducedMotion
        ? `translate(${OX}px, ${OY}px) rotate(0deg) translate(-${OX}px, -${OY}px)`
        : `translate(${OX}px, ${OY}px) rotate(${angle}deg) translate(-${OX}px, -${OY}px)`;

    const transition = reducedMotion
        ? `opacity 200ms ${EASE_OUT}`
        : `transform 900ms ${EASE_OUT}, opacity 220ms ${EASE_OUT}`;

    const opacity =
        reducedMotion && engaged ? Math.min(1, baseOpacity + 0.2) : baseOpacity;

    const style: CSSProperties = {
        transform,
        transformOrigin: `${OX}px ${OY}px`,
        transformBox: 'fill-box',
        transition,
        opacity,
    };

    return (
        <g style={style} data-ring={index}>
            {children}
        </g>
    );
}

export function ArmillarySphere() {
    const reducedMotion = usePrefersReducedMotion();
    const [hovered, setHovered] = useState(false);
    const [tapBurst, setTapBurst] = useState(false);
    const tapTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (tapTimerRef.current != null) {
                window.clearTimeout(tapTimerRef.current);
            }
        };
    }, []);

    const engaged = hovered || tapBurst;
    const burstMul = engaged && !reducedMotion ? 1 : 0;

    const angles = RING_LAYERS.map(
        (layer) => layer.rest + burstMul * layer.burst,
    );

    const triggerBurst = useCallback(() => {
        setTapBurst(true);

        if (tapTimerRef.current != null) {
            window.clearTimeout(tapTimerRef.current);
        }

        const duration = reducedMotion ? 320 : TAP_BURST_MS;
        tapTimerRef.current = window.setTimeout(() => {
            setTapBurst(false);
            tapTimerRef.current = null;
        }, duration);
    }, [reducedMotion]);

    return (
        <div
            className="touch-pan-y select-none"
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onPointerDown={(e) => {
                if (e.button === 0) {
                    triggerBurst();
                }
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerBurst();
                }
            }}
            role="button"
            tabIndex={0}
            aria-label="Armillary sphere — hover or press to animate rings"
        >
            <svg
                viewBox="0 0 427 279"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[min(92vw,28rem)] max-w-full cursor-pointer text-foreground"
                aria-hidden
            >
                <RotatingLayer
                    angle={angles[0] ?? 0}
                    reducedMotion={reducedMotion}
                    engaged={engaged}
                    index={0}
                    baseOpacity={0.92}
                >
                    <circle
                        cx="142.617"
                        cy="142.617"
                        r="134.117"
                        fill="none"
                        transform="matrix(1 0 -0.207912 0.978148 102.244 0)"
                        stroke="currentColor"
                        strokeWidth={
                            STROKE.ringOuter *
                            (reducedMotion && engaged ? 1.12 : 1)
                        }
                        vectorEffect="non-scaling-stroke"
                    />
                </RotatingLayer>

                <RotatingLayer
                    angle={angles[1] ?? 0}
                    reducedMotion={reducedMotion}
                    engaged={engaged}
                    index={1}
                    baseOpacity={0.88}
                >
                    <circle
                        cx="105.576"
                        cy="105.576"
                        r="98.0755"
                        fill="none"
                        transform="matrix(1 0 0.207912 0.978148 87.0601 33)"
                        stroke="currentColor"
                        strokeWidth={
                            STROKE.ringMid *
                            (reducedMotion && engaged ? 1.12 : 1)
                        }
                        vectorEffect="non-scaling-stroke"
                    />
                </RotatingLayer>

                <RotatingLayer
                    angle={angles[2] ?? 0}
                    reducedMotion={reducedMotion}
                    engaged={engaged}
                    index={2}
                    baseOpacity={0.84}
                >
                    <circle
                        cx="92.5"
                        cy="92.5"
                        r="86.5"
                        fill="none"
                        transform="matrix(0.943896 0.330242 -0.291862 0.95646 153.055 17)"
                        stroke="currentColor"
                        strokeWidth={
                            STROKE.ringInner *
                            (reducedMotion && engaged ? 1.12 : 1)
                        }
                        vectorEffect="non-scaling-stroke"
                    />
                </RotatingLayer>

                <RotatingLayer
                    angle={angles[3] ?? 0}
                    reducedMotion={reducedMotion}
                    engaged={engaged}
                    index={3}
                    baseOpacity={0.8}
                >
                    <path
                        d="M174.63 210.261L252.321 65.4298"
                        stroke="currentColor"
                        strokeWidth={
                            STROKE.axis * (reducedMotion && engaged ? 1.15 : 1)
                        }
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                    />
                </RotatingLayer>

                {/* Static bands — low-opacity fills, reference geometry */}
                <path
                    d="M2.07705 137.115C1.52994 137.208 1.00404 137.457 0.614611 137.865C0.225183 138.274 0.00417026 138.802 8.08511e-05 139.35C-0.00400856 139.897 0.209083 140.429 0.592365 140.843C0.975644 141.257 1.49777 141.514 2.04343 141.615C2.04343 141.615 2.04343 141.615 2.04343 141.615C3.45823 141.876 4.87312 142.124 6.28811 142.359C19.023 144.479 31.7654 145.587 44.5154 145.682C57.2654 145.778 70.023 144.86 82.7881 142.931C84.2065 142.716 85.6249 142.489 87.0434 142.25C87.5905 142.157 88.1164 141.909 88.5059 141.5C88.8953 141.091 89.1163 140.563 89.1204 140.015C89.1245 139.468 88.9114 138.936 88.5281 138.522C88.1448 138.108 87.6227 137.852 87.077 137.75C87.077 137.75 87.077 137.75 87.077 137.75C85.6623 137.49 84.2474 137.241 82.8324 137.006C70.0975 134.886 57.3551 133.778 44.6051 133.683C31.8551 133.587 19.0975 134.505 6.33238 136.434C4.91403 136.649 3.49559 136.876 2.07705 137.115Z"
                    className={`fill-foreground/12 transition-opacity duration-200 ease-out dark:fill-foreground/16 ${engaged ? 'opacity-100' : 'opacity-95'}`}
                />
                <path
                    d="M349.021 131.058C348.535 131.265 348.071 131.553 347.732 131.957C347.393 132.362 347.208 132.846 347.216 133.34C347.225 133.835 347.428 134.312 347.78 134.704C348.133 135.097 348.607 135.368 349.099 135.558C349.099 135.558 349.099 135.558 349.099 135.558C350.357 136.036 351.614 136.464 352.87 136.842C357.893 138.355 362.903 139.067 367.899 138.98C385.384 138.675 402.85 137.281 420.297 134.798C421.543 134.621 422.789 134.438 424.035 134.25C424.592 134.165 425.123 133.908 425.51 133.487C425.898 133.066 426.11 132.522 426.1 131.963C426.091 131.405 425.86 130.869 425.458 130.462C425.056 130.054 424.516 129.816 423.957 129.75C423.957 129.75 423.957 129.75 423.957 129.75C422.705 129.606 421.453 129.466 420.201 129.333C402.678 127.46 385.174 126.677 367.689 126.982C362.694 127.069 357.712 127.956 352.744 129.643C351.502 130.065 350.261 130.537 349.021 131.058Z"
                    className={`fill-foreground/12 transition-opacity duration-200 ease-out dark:fill-foreground/16 ${engaged ? 'opacity-100' : 'opacity-95'}`}
                />

                {/* Hub — static, above rings; theme-aware fills */}
                <path
                    d="M264.06 138C264.06 165.614 241.674 188 214.06 188C186.446 188 164.06 165.614 164.06 138C164.06 110.386 186.446 88 214.06 88C241.674 88 264.06 110.386 264.06 138Z"
                    className={`fill-white transition-opacity duration-200 ease-out dark:fill-foreground/12 ${engaged ? 'opacity-100' : 'opacity-[0.97]'}`}
                />
                <path
                    d="M256.06 165C254.384 166.142 252.625 167.138 250.814 168C234.35 175.43 215.613 173.874 199.728 167.627C183.762 161.367 170.64 147.949 167.055 130.005C166.625 127.986 166.301 126.088 166.06 124C165.835 126.09 165.715 128.035 165.733 130.149C165.242 148.943 179.079 167.357 197.094 174.113C214.794 181.213 236.307 180.349 251.508 169.134C253.158 167.879 254.69 166.495 256.06 165Z"
                    className={`fill-foreground/40 transition-opacity duration-200 ease-out dark:fill-foreground/55 ${engaged ? 'opacity-100' : 'opacity-90'}`}
                />
            </svg>
        </div>
    );
}
