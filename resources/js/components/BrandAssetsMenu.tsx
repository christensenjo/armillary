import { Menu } from '@base-ui/react/menu';

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
    {
        href: '/brand/site.webmanifest',
        label: 'Web manifest',
        filename: 'site.webmanifest',
    },
];

export function BrandAssetsMenu() {
    return (
        <Menu.Root modal={false}>
            <Menu.Trigger
                className="inline-flex size-10 items-center justify-center rounded-lg ring-offset-background transition-colors duration-150 ease-out hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97]"
                aria-label="Open brand assets menu"
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
                <Menu.Positioner side="bottom" align="end" sideOffset={8}>
                    <Menu.Popup className="brand-menu-popup z-50 min-w-[14rem] overflow-hidden rounded-xl border border-border bg-popover py-1 text-popover-foreground shadow-lg shadow-black/5">
                        <Menu.Viewport>
                            <Menu.Group>
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
                                        className="transition-colors duration-150 ease-out outline-none data-highlighted:bg-accent/80"
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
                        </Menu.Viewport>
                    </Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.Root>
    );
}
