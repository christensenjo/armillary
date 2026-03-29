import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import { ArmillaryHeerichDevDashboard } from '@/components/ArmillaryHeerichDevDashboard';
import { ArmillarySphere } from '@/components/ArmillarySphere';
import { ClientOnly } from '@/components/ClientOnly';
import { LogoMenu } from '@/components/LogoMenu';
import { DEFAULT_ARMILLARY_HEERICH_CONFIG } from '@/lib/armillaryHeerichScene';
import type { ArmillaryHeerichConfig } from '@/lib/armillaryHeerichScene';

export default function Welcome() {
    const { appLocal } = usePage().props;
    const [armillaryDevConfig, setArmillaryDevConfig] =
        useState<ArmillaryHeerichConfig>(() => ({
            ...DEFAULT_ARMILLARY_HEERICH_CONFIG,
        }));

    return (
        <>
            <Head title="Armillary Software">
                <meta
                    name="description"
                    content="Armillary Software — contracting, assets, and deployed software."
                />
            </Head>
            <div className="flex min-h-dvh flex-col bg-landing font-ui text-landing-foreground">
                <header className="pointer-events-none fixed inset-x-0 top-0 z-10 mr-12 flex justify-between p-4 sm:p-6">
                    <div className="pointer-events-auto mb-0">
                        <ClientOnly>
                            <LogoMenu />
                        </ClientOnly>
                    </div>
                    <div className="flex shrink-0 justify-start">
                        <h1 className="text-center font-wordmark text-[clamp(1.75rem,6vw,3.75rem)] leading-none tracking-tight text-landing-foreground lowercase">
                            armillary software
                        </h1>
                    </div>
                </header>

                <main className="flex min-h-0 w-full flex-1 flex-col px-6">
                    <div
                        className={`relative flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-8 ${appLocal ? 'lg:flex-row lg:gap-10' : ''}`}
                    >
                        {appLocal ? (
                            <ArmillaryHeerichDevDashboard
                                value={armillaryDevConfig}
                                onChange={setArmillaryDevConfig}
                            />
                        ) : null}
                        <div className="flex min-w-3/4 shrink-0 justify-center">
                            <ArmillarySphere
                                config={
                                    appLocal ? armillaryDevConfig : undefined
                                }
                            />
                        </div>
                    </div>
                </main>

                <footer className="mt-auto flex shrink-0 justify-center gap-8 px-6 pt-8 pb-10 font-ui text-sm text-muted-foreground">
                    <a
                        href="https://joelchristensen.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-border underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out hover:text-foreground hover:decoration-current focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97]"
                    >
                        founder
                    </a>
                    <a
                        href="https://primestats.net"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-border underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out hover:text-foreground hover:decoration-current focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97]"
                    >
                        work
                    </a>
                </footer>
            </div>
        </>
    );
}
