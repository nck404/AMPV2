import { writable } from "svelte/store";

const DEFAULTS = {
  fontScale: 1,
  highContrast: false,
  speechFeedback: true,
  hapticFeedback: true,
};

function load() {
  if (typeof localStorage === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem("access-settings");
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export const accessSettings = writable(load());

export function updateAccessSettings(patch) {
  accessSettings.update((s) => {
    const next = { ...s, ...patch };
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("access-settings", JSON.stringify(next));
    }
    applyAccessSettings(next);
    return next;
  });
}

export function applyAccessSettings(settings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--a11y-scale", settings.fontScale);
  root.classList.toggle("high-contrast", settings.highContrast);
}

export function haptic(pattern = 15) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}
