import { apiFetch, getHeaders } from '../baseFetcher';

export const fetchUsers = async (params?: { search?: string; role?: string; userId?: string; username?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role) query.append('role', params.role);
    if (params?.userId) query.append('userId', params.userId);
    if (params?.username) query.append('username', params.username);
    return apiFetch(`/users?${query.toString()}`);
};

export const fetchPickers = async () => {
    const result = await apiFetch('/users?role=picker');
    return result.data;
};

export const fetchUserById = async (id: string) => {
    return apiFetch(`/users/${id}`);
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

export const bulkCreateUsers = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/users/bulk-create', {
        method: 'POST',
        body: formData
    });
};

export const deleteUser = async (id: string) => {
    return apiFetch(`/users/${id}`, {
        method: 'DELETE'
    });
};

export const resetPassword = async (userId: string, newPassword: string) => {
    return apiFetch('/auth/reset-password', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, newPassword })
    });
};
