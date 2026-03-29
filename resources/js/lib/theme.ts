export const THEME_STORAGE_KEY = 'armillary-theme';

/** Approximates `background` (shadcn tokens) for `theme-color` meta. */
const THEME_COLOR_LIGHT = '#faf9f6';
const THEME_COLOR_DARK = '#1e2524';

export type ThemePreference = 'light' | 'dark';

function syncThemeColorMeta(): void {
    const meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
        return;
    }

    meta.setAttribute(
        'content',
        document.documentElement.classList.contains('dark')
            ? THEME_COLOR_DARK
            : THEME_COLOR_LIGHT,
    );
}

export function subscribeDocumentDarkClass(cb: () => void): () => void {
    const el = document.documentElement;
    const mo = new MutationObserver(cb);

    mo.observe(el, { attributes: true, attributeFilter: ['class'] });

    return () => mo.disconnect();
}

export function snapshotDocumentDark(): boolean {
    return document.documentElement.classList.contains('dark');
}

export function applyThemePreference(pref: ThemePreference): void {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
    document.documentElement.classList.toggle('dark', pref === 'dark');
    syncThemeColorMeta();
}
