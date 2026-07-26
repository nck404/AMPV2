import { writable } from 'svelte/store';

export const toasts = writable([]);

export const addToast = (toast) => {
    const id = Math.floor(Math.random() * 10000) + Date.now();

    const defaults = {
        id,
        type: 'info',
        timeout: 3000,
        message: ''
    };

    const newToast = { ...defaults, ...toast };

    toasts.update((all) => [newToast, ...all]);

    if (newToast.timeout) {
        setTimeout(() => dismissToast(id), newToast.timeout);
    }
};

export const dismissToast = (id) => {
    toasts.update((all) => all.filter((t) => t.id !== id));
};
