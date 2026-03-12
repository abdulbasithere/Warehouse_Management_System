
const API_BASE = 'http://localhost:5000/api';

// --- Helper for authenticated fetch ---
export const apiFetch = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
};

export const getHeaders = () => ({
    'Content-Type': 'application/json',
});
