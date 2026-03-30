import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { encode } from 'qss';
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
} from 'motion/react';
import type { ComponentProps } from 'react';
import React from 'react';

import { cn } from '@/lib/utils';

type LinkPreviewProps = {
    children: React.ReactNode;
    url: string;
    className?: string;
    width?: number;
    height?: number;
    quality?: number;
    layout?: string;
    target?: ComponentProps<'a'>['target'];
    rel?: string;
} & (
    | { isStatic: true; imageSrc: string }
    | { isStatic?: false; imageSrc?: never }
);

export const LinkPreview = ({
    children,
    url,
    className,
    width = 200,
    height = 125,
    quality: _quality = 50,
    layout: _layout = 'fixed',
    isStatic = false,
    imageSrc = '',
    target,
    rel,
}: LinkPreviewProps) => {
    let src;
    if (!isStatic) {
        const params = encode({
            url,
            screenshot: true,
            meta: false,
            embed: 'screenshot.url',
            colorScheme: 'dark',
            'viewport.isMobile': true,
            'viewport.deviceScaleFactor': 1,
            'viewport.width': width * 3,
            'viewport.height': height * 3,
        });
        src = `https://api.microlink.io/?${params}`;
    } else {
        src = imageSrc;
    }

    const [isOpen, setOpen] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);
    const reduceMotion = useReducedMotion();

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const springConfig = { stiffness: 100, damping: 15 };
    const xAxis = useMotionValue(0);
    const translateX = useSpring(xAxis, springConfig);

    const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
        const targetEl = event.currentTarget;
        const targetRect = targetEl.getBoundingClientRect();
        const eventOffsetX = event.clientX - targetRect.left;
        const offsetFromCenter =
            (eventOffsetX - targetRect.width / 2) / 2;
        xAxis.set(offsetFromCenter);
    };

    const enterExitTransition = reduceMotion
        ? { duration: 0.15 }
        : {
              type: 'spring' as const,
              stiffness: 260,
              damping: 20,
          };

    return (
        <>
            {isMounted ? (
                <div className="hidden" aria-hidden>
                    <img
                        src={src}
                        width={width}
                        height={height}
                        alt=""
                    />
                </div>
            ) : null}

            <HoverCardPrimitive.Root
                openDelay={50}
                closeDelay={100}
                onOpenChange={(open) => {
                    setOpen(open);
                }}
            >
                <HoverCardPrimitive.Trigger asChild>
                    <a
                        href={url}
                        target={target}
                        rel={rel}
                        onMouseMove={handleMouseMove}
                        className={cn(className)}
                    >
                        {children}
                    </a>
                </HoverCardPrimitive.Trigger>

                <HoverCardPrimitive.Content
                    className="origin-(--radix-hover-card-content-transform-origin)"
                    side="top"
                    align="center"
                    sideOffset={10}
                >
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={
                                    reduceMotion
                                        ? { opacity: 0 }
                                        : { opacity: 0, y: 20, scale: 0.6 }
                                }
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: enterExitTransition,
                                }}
                                exit={
                                    reduceMotion
                                        ? { opacity: 0 }
                                        : { opacity: 0, y: 20, scale: 0.6 }
                                }
                                className="rounded-xl shadow-xl"
                                style={{
                                    x: reduceMotion ? 0 : translateX,
                                }}
                            >
                                <a
                                    href={url}
                                    target={target}
                                    rel={rel}
                                    className="block rounded-xl border-2 border-transparent bg-white p-1 shadow hover:border-neutral-200 dark:hover:border-neutral-800"
                                    style={{ fontSize: 0 }}
                                >
                                    <img
                                        src={isStatic ? imageSrc : src}
                                        width={width}
                                        height={height}
                                        className="rounded-lg"
                                        alt=""
                                    />
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </HoverCardPrimitive.Content>
            </HoverCardPrimitive.Root>
        </>
    );
};
