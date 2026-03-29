import { Head } from '@inertiajs/react';

import { ArmillarySphere } from '@/components/ArmillarySphere';
import { BrandAssetsMenu } from '@/components/BrandAssetsMenu';
import { ClientOnly } from '@/components/ClientOnly';

export default function Welcome() {
    return (
        <>
            <Head title="Armillary Software">
                <meta
                    name="description"
                    content="Armillary Software — contracting, assets, and deployed software."
                />
            </Head>
            <div className="flex min-h-dvh flex-col bg-landing font-ui text-landing-foreground">
                <header className="pointer-events-none fixed inset-x-0 top-0 z-10 flex justify-end p-4 sm:p-6">
                    <div className="pointer-events-auto">
                        <ClientOnly>
                            <BrandAssetsMenu />
                        </ClientOnly>
                    </div>
                </header>

                <main className="flex flex-1 flex-col items-center px-6 pt-[22vh] sm:pt-[24vh]">
                    <h1 className="text-center font-wordmark text-[clamp(1.75rem,6vw,3.75rem)] leading-none tracking-tight text-landing-foreground lowercase">
                        armillary software
                    </h1>
                    <div className="mt-8 flex w-full justify-center sm:mt-11">
                        <ArmillarySphere />
                    </div>
                </main>

                <footer className="flex justify-center gap-8 px-6 pt-8 pb-10 font-ui text-sm text-muted-foreground">
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
