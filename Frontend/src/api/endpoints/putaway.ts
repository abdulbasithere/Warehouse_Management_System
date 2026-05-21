import { apiFetch, getHeaders } from '../baseFetcher';

export const fetchPutaways = async (params: any) => {
    const query = new URLSearchParams(params);
    return apiFetch(`/putaway?${query}`);
};

export const fetchPutawayDetail = async (id: string) => {
    return apiFetch(`/putaway/${id}`);
};

export const createPutaway = async (data: any) => {
    return apiFetch('/putaway', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const bulkCreatePutaway = async (data: { items: { productId: string; totalUnits: number }[] }) => {
    return apiFetch('/putaway/bulk', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const assignPicker = async (data: { putawayIds: number[]; userId: number }) => {
    return apiFetch('/putaway/assign-picker', {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const scanPutawayItem = async (id: string, sku: string, shelf: string) => {
    return apiFetch(`/putaway/${id}/scan`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ sku, shelf })
    });
};

export const completePutaway = async (id: string, scans: { shelfId: string; quantity: number }[]) => {
    return apiFetch(`/putaway/${id}/complete`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ scans })
    });
};
