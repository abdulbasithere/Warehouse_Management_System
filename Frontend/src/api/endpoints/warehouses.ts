import { apiFetch, getHeaders } from '../baseFetcher';

export const fetchWarehouses = async (params: { search?: string } = {}) => {
    const query = new URLSearchParams({
        search: params.search || ''
    });
    return apiFetch(`/warehouses?${query}`);
};

export const fetchWarehouseById = async (id: string) => {
    return apiFetch(`/warehouses/${id}`);
};

export const createWarehouse = async (data: any) => {
    return apiFetch('/warehouses', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const updateWarehouse = async (id: string, data: any) => {
    return apiFetch(`/warehouses/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const deleteWarehouse = async (id: string) => {
    return apiFetch(`/warehouses/${id}`, {
        method: 'DELETE'
    });
};
