import { PUBLIC_API_DOMAIN } from '$env/static/public';

/**
 * Static base for uploads (avatars, images, etc.)
 */
export const STATIC_BASE = PUBLIC_API_DOMAIN.startsWith('http') 
    ? (new URL(PUBLIC_API_DOMAIN)).origin 
    : '';

/**
 * Gets the auth token from localStorage
 */
const getToken = () => {
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

/**
 * Common handler for 401 Unauthorized responses
 */
const handleUnauthorized = (response) => {
    if (response.status === 401) {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login?error=expired';
        }
    }
};

export const api = {
    async post(endpoint, data) {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${PUBLIC_API_DOMAIN}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        
        handleUnauthorized(response);
        return await response.json();
    },

    async get(endpoint) {
        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${PUBLIC_API_DOMAIN}${endpoint}`, {
            headers
        });

        handleUnauthorized(response);
        return await response.json();
    },

    async put(endpoint, data) {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${PUBLIC_API_DOMAIN}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });

        handleUnauthorized(response);
        return await response.json();
    },

    async upload(endpoint, formData) {
        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${PUBLIC_API_DOMAIN}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData
        });

        handleUnauthorized(response);
        return await response.json();
    },

    async delete(endpoint) {
        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${PUBLIC_API_DOMAIN}${endpoint}`, {
            method: 'DELETE',
            headers
        });

        handleUnauthorized(response);
        return await response.json();
    }
};
