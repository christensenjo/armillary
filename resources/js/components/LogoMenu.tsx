import { Menu } from '@base-ui/react/menu';
import { Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { applyThemePreference } from '@/lib/theme';
import { cn } from '@/lib/utils';

const ASSETS = [
    {
        href: '/brand/armillary_logo.svg',
        label: 'Logomark',
        filename: 'armillary_logo.svg',
    },
    {
        href: '/brand/favicon.svg',
        label: 'Favicon (SVG)',
        filename: 'favicon.svg',
    },
];

export function LogoMenu() {
    const [dark, setDark] = useState(() =>
        typeof document !== 'undefined'
            ? document.documentElement.classList.contains('dark')
            : false,
    );

    useEffect(() => {
        setDark(document.documentElement.classList.contains('dark'));
    }, []);

    const setLight = useCallback(() => {
        applyThemePreference('light');
        setDark(false);
    }, []);

    const setDarkMode = useCallback(() => {
        applyThemePreference('dark');
        setDark(true);
    }, []);

    return (
        <Menu.Root modal={false}>
            <Menu.Trigger
                className="inline-flex size-10 items-center justify-center rounded-lg ring-offset-background transition-colors duration-150 ease-out hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97]"
                aria-label="Open menu"
            >
                <img
                    src="/brand/armillary_logo.svg"
                    alt=""
                    width={60}
                    height={60}
                    className="pointer-events-none size-15 object-contain"
                    draggable={false}
                />
            </Menu.Trigger>
            <Menu.Portal>
                <Menu.Positioner
                    className="h-fit min-h-0"
                    side="bottom"
                    align="end"
                    sideOffset={8}
                >
                    <Menu.Popup className="brand-menu-popup z-50 h-fit min-h-0 min-w-[14rem] overflow-hidden rounded-xl border border-border bg-popover py-1 text-popover-foreground shadow-lg shadow-black/5">
                        <div className="border-b border-border px-1 pb-2">
                            <div className="px-3 py-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                Appearance
                            </div>
                            <div
                                className="mx-1 flex gap-1 p-0.5"
                                role="group"
                                aria-label="Theme"
                            >
                                <button
                                    type="button"
                                    onClick={setLight}
                                    aria-pressed={!dark}
                                    className={cn(
                                        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors duration-150 ease-landing-out outline-none hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover dark:hover:bg-foreground/9',
                                        !dark
                                            ? 'bg-foreground/10 text-foreground'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    <Sun
                                        className="size-3.5 shrink-0 opacity-80"
                                        aria-hidden
                                    />
                                    Light
                                </button>
                                <button
                                    type="button"
                                    onClick={setDarkMode}
                                    aria-pressed={dark}
                                    className={cn(
                                        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors duration-150 ease-landing-out outline-none hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover dark:hover:bg-foreground/9',
                                        dark
                                            ? 'bg-foreground/10 text-foreground'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    <Moon
                                        className="size-3.5 shrink-0 opacity-80"
                                        aria-hidden
                                    />
                                    Dark
                                </button>
                            </div>
                        </div>
                        <Menu.Group className="flex flex-col gap-0 pt-1">
                            <Menu.GroupLabel className="px-3 py-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                Brand assets
                            </Menu.GroupLabel>
                            {ASSETS.map((item) => (
                                <Menu.LinkItem
                                    key={item.href}
                                    href={item.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    download={item.filename}
                                    closeOnClick
                                    className="mx-1 shrink-0 rounded-lg transition-[background-color] duration-150 ease-landing-out outline-none data-highlighted:bg-foreground/6 dark:data-highlighted:bg-foreground/9"
                                >
                                    <span className="flex flex-col gap-0.5 px-3 py-2">
                                        <span className="text-sm font-medium text-foreground">
                                            {item.label}
                                        </span>
                                        <span className="font-ui text-xs text-muted-foreground tabular-nums">
                                            {item.filename}
                                        </span>
                                    </span>
                                </Menu.LinkItem>
                            ))}
                        </Menu.Group>
                    </Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.Root>
    );
}
