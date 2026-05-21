import { apiFetch, getHeaders } from '../baseFetcher';

export const getAllTransferOrders = async (search?: string) => {
    let url = '/transfer-orders';
    if (search) {
        url += `?search=${encodeURIComponent(search)}`;
    }
    return apiFetch(url, {
        headers: getHeaders(),
    });
};

export const getTransferOrderById = async (id: string | number) => {
    return apiFetch(`/transfer-orders/${id}`, {
        headers: getHeaders(),
    });
};

export const createTransferOrder = async (data: any) => {
    return apiFetch('/transfer-orders', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
};

export const updateTransferOrder = async (id: string | number, data: any) => {
    return apiFetch(`/transfer-orders/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
};

export const deleteTransferOrder = async (id: string | number) => {
    return apiFetch(`/transfer-orders/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
};
