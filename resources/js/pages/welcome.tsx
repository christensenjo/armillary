import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import { ArmillaryHeerichDevDashboard } from '@/components/ArmillaryHeerichDevDashboard';
import { ArmillarySphere } from '@/components/ArmillarySphere';
import { ClientOnly } from '@/components/ClientOnly';
import { LogoMenu } from '@/components/LogoMenu';
import { LinkPreview } from '@/components/ui/link-preview';
import {
    ARMILLARY_DARK_APPEARANCE_OVERRIDES,
    DEFAULT_ARMILLARY_HEERICH_CONFIG,
} from '@/lib/armillaryHeerichScene';
import type {
    ArmillaryHeerichConfig,
    ArmillaryHeerichDarkAppearance,
} from '@/lib/armillaryHeerichScene';
import { mergeArmillaryMotionRig } from '@/lib/armillaryMotionRig';
import type { ArmillaryMotionRigConfig } from '@/lib/armillaryMotionRig';

export default function Welcome() {
    const { appLocal } = usePage().props;
    const [armillaryDevConfig, setArmillaryDevConfig] =
        useState<ArmillaryHeerichConfig>(() => ({
            ...DEFAULT_ARMILLARY_HEERICH_CONFIG,
        }));
    const [armillaryDarkAppearance, setArmillaryDarkAppearance] =
        useState<ArmillaryHeerichDarkAppearance>(() => ({
            ...ARMILLARY_DARK_APPEARANCE_OVERRIDES,
        }));
    const [armillaryMotionRig, setArmillaryMotionRig] =
        useState<ArmillaryMotionRigConfig>(() => mergeArmillaryMotionRig());

    return (
        <>
            <Head title="Armillary Software">
                <meta
                    name="description"
                    content="Armillary Software — contracting, assets, and deployed software."
                />
            </Head>
            <div className="flex min-h-dvh flex-col bg-background font-ui text-foreground">
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-popover focus:px-4 focus:py-2 focus:text-sm focus:text-popover-foreground focus:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                    Skip to main content
                </a>
                <header className="pointer-events-none fixed inset-x-0 top-0 z-10 mr-12 flex justify-between p-4 sm:p-6">
                    <div className="pointer-events-auto mb-0">
                        <ClientOnly>
                            <LogoMenu />
                        </ClientOnly>
                    </div>
                    <div className="flex shrink-0 justify-start">
                        <h1 className="text-center font-wordmark text-[clamp(1.75rem,6vw,3.75rem)] leading-none tracking-tight text-balance text-foreground lowercase">
                            armillary software
                        </h1>
                    </div>
                </header>

                <main
                    id="main-content"
                    tabIndex={-1}
                    className="flex min-h-0 w-full flex-1 scroll-mt-24 flex-col px-6 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                    <div className="relative flex min-h-0 w-full flex-1 flex-col">
                        {appLocal ? (
                            <ArmillaryHeerichDevDashboard
                                value={armillaryDevConfig}
                                onChange={setArmillaryDevConfig}
                                darkAppearance={armillaryDarkAppearance}
                                onDarkAppearanceChange={
                                    setArmillaryDarkAppearance
                                }
                                motionRig={armillaryMotionRig}
                                onMotionRigChange={setArmillaryMotionRig}
                            />
                        ) : null}
                        <div
                            className={`flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-8 ${appLocal ? 'lg:flex-row lg:gap-10' : ''}`}
                        >
                            <div className="flex min-w-3/4 shrink-0 justify-center">
                                <ArmillarySphere
                                    config={
                                        appLocal
                                            ? armillaryDevConfig
                                            : undefined
                                    }
                                    darkAppearance={
                                        appLocal
                                            ? armillaryDarkAppearance
                                            : undefined
                                    }
                                    motionRig={
                                        appLocal
                                            ? armillaryMotionRig
                                            : undefined
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="mt-auto flex shrink-0 justify-center gap-8 px-6 pt-8 pb-10 font-ui text-sm text-muted-foreground">
                    <LinkPreview
                        url="https://joelchristensen.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="touch-manipulation border-border underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out hover:text-foreground hover:decoration-current focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97] motion-reduce:active:scale-100"
                    >
                        founder
                    </LinkPreview>
                    <LinkPreview
                        url="https://primestats.net"
                        isStatic
                        imageSrc="/images/primestats.png"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="touch-manipulation border-border underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out hover:text-foreground hover:decoration-current focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97] motion-reduce:active:scale-100"
                    >
                        work
                    </LinkPreview>
                </footer>
            </div>
        </>
    );
}
