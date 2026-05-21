import { apiFetch, getHeaders } from '../baseFetcher';

export const fetchShelfLocations = async (params: { page: number; pageSize?: number; search?: string; warehouseId?: string | number }) => {
    const query = new URLSearchParams({
        page: params.page.toString(),
        pageSize: (params.pageSize || 10).toString(),
        search: params.search || '',
        warehouseId: params.warehouseId?.toString() || ''
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

export const updateShelfLocation = async (id: string, data: any) => {
    return apiFetch(`/shelf-locations/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const deleteShelfLocation = async (id: string) => {
    return apiFetch(`/shelf-locations/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
};

export const fetchCrossDockLocations = async () => {
    return apiFetch('/shelf-locations/cross-dock');
};

export const bulkCreateShelfLocations = async (formData: FormData) => {
    return apiFetch('/shelf-locations/bulk-create', {
        method: 'POST',
        body: formData
    });
};
