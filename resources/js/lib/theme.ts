export const THEME_STORAGE_KEY = 'armillary-theme';

export type ThemePreference = 'light' | 'dark';

export function applyThemePreference(pref: ThemePreference): void {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
    document.documentElement.classList.toggle('dark', pref === 'dark');
}
