import { apiFetch, getHeaders } from '../baseFetcher';

export const createAdjustment = async (data: any) => {
    return apiFetch('/inventory/adjust', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const fetchAdjustmentHistory = async (params: { page: number; pageSize?: number }) => {
    const query = new URLSearchParams({
        page: params.page.toString(),
        pageSize: (params.pageSize || 10).toString()
    });
    return apiFetch(`/inventory/history?${query}`);
};
