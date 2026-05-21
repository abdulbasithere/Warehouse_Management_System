import { apiFetch, getHeaders } from '../baseFetcher';

export const fetchRoles = async () => {
    return apiFetch('/roles');
};

export const fetchRoleById = async (id: string) => {
    return apiFetch(`/roles/${id}`);
};

export const createRole = async (data: any) => {
    return apiFetch('/roles', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const updateRole = async (id: string, data: any) => {
    return apiFetch(`/roles/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const deleteRole = async (id: string) => {
    return apiFetch(`/roles/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
};
