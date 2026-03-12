import { apiFetch, getHeaders } from '../baseFetcher';

export const fetchProducts = async (params: { page: number; pageSize?: number; search?: string }) => {
    const query = new URLSearchParams({
        page: params.page.toString(),
        pageSize: (params.pageSize || 10).toString(),
        search: params.search || ''
    });
    return apiFetch(`/products?${query}`);
};

export const createProduct = async (data: any) => {
    return apiFetch('/products', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const updateProduct = async (id: string, data: any) => {
    return apiFetch(`/products/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const deleteProduct = async (id: string) => {
    return apiFetch(`/products/${id}`, {
        method: 'DELETE'
    });
};

export const bulkDeleteProducts = async (ids: string[]) => {
    return apiFetch('/products/bulk-delete', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ids })
    });
};

export const bulkCreateProducts = async (formData: FormData) => {
    return apiFetch('/products/bulk-create', {
        method: 'POST',
        body: formData
    });
};
