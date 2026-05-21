import { apiFetch, getHeaders } from '../baseFetcher';

export const fetchProducts = async (params: { page: number; pageSize?: number; search?: string }) => {
    const query = new URLSearchParams({
        page: params.page.toString(),
        pageSize: (params.pageSize || 10).toString(),
        search: params.search || ''
    });
    return apiFetch(`/products?${query}`);
};

export const getProducts = async (params: { page: number; pageSize?: number; search?: string }) => {
    const query = new URLSearchParams({
        page: params.page.toString(),
        pageSize: (params.pageSize || 10).toString(),
        search: params.search || ''
    });
    return apiFetch(`/products?${query}`);
};

export const getVariants = async (params: { page: number; pageSize?: number; search?: string }) => {
    const query = new URLSearchParams({
        page: params.page.toString(),
        pageSize: (params.pageSize || 10).toString(),
        search: params.search || ''
    });
    return apiFetch(`/products/variants?${query}`);
};

export const getBarcodes = async (params: { page: number; pageSize?: number; search?: string }) => {
    const query = new URLSearchParams({
        page: params.page.toString(),
        pageSize: (params.pageSize || 10).toString(),
        search: params.search || ''
    });
    return apiFetch(`/products/barcodes?${query}`);
};

export const getProduct = async (id: string) => {
    return apiFetch(`/products/${id}`);
};

export const getProductInfo = async (id: string) => {
    return apiFetch(`/products/${id}/info`);
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

export const bulkCreateVariants = async (formData: FormData) => {
    return apiFetch('/products/bulk-create-variants', {
        method: 'POST',
        body: formData
    });
};

export const bulkCreateBarcodes = async (formData: FormData) => {
    return apiFetch('/products/bulk-create-barcodes', {
        method: 'POST',
        body: formData
    });
};

export const bulkUpdateBarcodeStatus = async (barcodes: string[], isActive: boolean) => {
    return apiFetch('/products/bulk-barcode-status', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ barcodes, isActive })
    });
};
