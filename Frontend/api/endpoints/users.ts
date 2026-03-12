import { apiFetch, getHeaders } from '../baseFetcher';

export const fetchUsers = async (params?: { search?: string; role?: string }) => {
    const query = new URLSearchParams({
        search: params?.search || '',
        role: params?.role || ''
    });
    return apiFetch(`/users?${query}`);
};

export const fetchPickers = async () => {
    const result = await apiFetch('/users?role=picker');
    return result.data;
};

export const createUser = async (data: any) => {
    return apiFetch('/users', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const updateUser = async (id: string, data: any) => {
    return apiFetch(`/users/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const deleteUser = async (id: string) => {
    return apiFetch(`/users/${id}`, {
        method: 'DELETE'
    });
};

export const resetPassword = async (id: string, pass: string) => {
    return apiFetch(`/users/${id}/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ newPassword: pass })
    });
};
