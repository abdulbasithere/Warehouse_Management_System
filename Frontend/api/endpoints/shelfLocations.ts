import { apiFetch, getHeaders } from '../baseFetcher';

export const fetchShelfLocations = async (params: { page: number; pageSize?: number; search?: string }) => {
    const query = new URLSearchParams({
        page: params.page.toString(),
        pageSize: (params.pageSize || 10).toString(),
        search: params.search || ''
    });
    return apiFetch(`/shelf-locations?${query}`);
};

export const createShelfLocation = async (data: any) => {
    return apiFetch('/shelf-locations', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const bulkCreateShelfLocations = async (formData: FormData) => {
    return apiFetch('/shelf-locations/bulk-create', {
        method: 'POST',
        body: formData
    });
};
