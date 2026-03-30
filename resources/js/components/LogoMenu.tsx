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
                className="inline-flex size-15 touch-manipulation items-center justify-center rounded-lg ring-offset-background transition-[color,background-color,transform] duration-150 ease-out hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97] motion-reduce:active:scale-100"
                aria-label="Open menu"
            >
                {/* <img
                    src="/brand/armillary_logo.svg"
                    alt=""
                    width={60}
                    height={60}
                    className="pointer-events-none size-15 object-contain text-abyss dark:text-lightspeed"
                    draggable={false}
                /> */}
                <span className="pointer-events-none size-12 h-fit w-fit object-contain text-abyss dark:text-lightspeed">
                    <svg
                        width={48}
                        height={48}
                        viewBox="0 0 1500 1500"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                        focusable="false"
                    >
                        <path
                            d="M1324.33 267.846C1481.84 455.824 1544.08 717.213 1467.03 969.22C1345.96 1365.23 926.787 1588.11 530.778 1467.04C431.275 1436.62 342.704 1387.37 267.771 1324.4L374.408 1217.77C576.308 1378.52 846.569 1459.83 1092.95 1396.48C1122.93 1388.29 1152 1377.66 1179.46 1364.57C1149.74 1371.03 1119.68 1374.99 1089.66 1376.8C850.332 1386.37 625.759 1288.24 448.54 1143.64L1324.33 267.846ZM192.324 1251.36C215.624 1277.33 240.815 1301.75 267.771 1324.4L148.441 1443.74C127.939 1464.24 94.6976 1464.24 74.1952 1443.73C53.6928 1423.23 53.6927 1389.99 74.1952 1369.49L192.324 1251.36ZM158.395 289.014C143.539 316.767 130.963 343.113 119.341 372.581C9.21352 625.905 92.3604 951.422 295.664 1148.02L192.324 1251.36C22.6243 1062.24 -46.7458 791.487 32.9608 530.777C60.5546 440.522 103.635 359.261 158.395 289.014ZM370.061 1073.62C373.834 1077.32 377.639 1080.99 381.479 1084.63C402.973 1105 425.352 1124.72 448.54 1143.64L374.408 1217.77C351.482 1199.51 329.436 1180.24 308.408 1160.03C304.109 1156.08 299.861 1152.08 295.664 1148.02L370.061 1073.62ZM158.431 288.969C343.943 51.0286 663.484 -60.5111 969.218 32.9616C1077.35 66.0206 1172.57 121.306 1251.41 192.276L370.061 1073.62C190.328 897.197 88.6414 642.099 138.541 378.001C143.904 347.531 150.059 319.337 158.431 288.969ZM1389.06 54.6237C1409.56 34.1212 1442.8 34.122 1463.31 54.6247C1483.81 75.1273 1483.81 108.368 1463.31 128.871L1324.33 267.846C1301.91 241.089 1277.56 215.82 1251.41 192.276L1389.06 54.6237Z"
                            fill="currentColor"
                        />
                    </svg>
                </span>
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
                                        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors duration-150 ease-out-soft outline-none hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover dark:hover:bg-foreground/9',
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
                                        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors duration-150 ease-out-soft outline-none hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover dark:hover:bg-foreground/9',
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
                                    className="mx-1 shrink-0 rounded-lg transition-[background-color] duration-150 ease-out-soft outline-none data-highlighted:bg-foreground/6 dark:data-highlighted:bg-foreground/9"
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
