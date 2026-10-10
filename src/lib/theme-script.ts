/**
 * Server-safe half of the theme module: the storage key and the inline
 * script the root layout runs in <head>, before first paint, so pages
 * never flash the wrong theme. Kept in sync with `readThemePreference` /
 * `applyTheme` in `./theme.ts`. `?theme=light|dark` previews a theme for
 * one page load without saving it.
 */

export const THEME_STORAGE_KEY = 'lx-theme';

export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement;var q=new URLSearchParams(location.search).get('theme');var t=q==='light'||q==='dark'?q:localStorage.getItem('${THEME_STORAGE_KEY}');var l=t==='light'||(t!=='dark'&&matchMedia('(prefers-color-scheme: light)').matches);if(l)d.classList.add('light');d.style.colorScheme=l?'light':'dark';}catch(e){}})();`;
