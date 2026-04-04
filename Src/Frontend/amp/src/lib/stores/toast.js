import { writable } from 'svelte/store';

export const toasts = writable([]);

export const addToast = (toast) => {
    // Generate a unique ID
    const id = Math.floor(Math.random() * 10000) + Date.now();

    // Set default values
    const defaults = {
        id,
        type: 'info', // 'info', 'success', 'warning', 'error'
        timeout: 3000,
        message: ''
    };

    const newToast = { ...defaults, ...toast };

    // Add the new toast to the top of the array
    toasts.update((all) => [newToast, ...all]);

    // If timeout is greater than 0, set a timer to dismiss it
    if (newToast.timeout) {
        setTimeout(() => dismissToast(id), newToast.timeout);
    }
};

export const dismissToast = (id) => {
    toasts.update((all) => all.filter((t) => t.id !== id));
};
