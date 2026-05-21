import { apiFetch, getHeaders } from '../baseFetcher';

export const fetchSuppliers = async () => {
    return apiFetch('/suppliers');
};

export const fetchSupplierById = async (id: string) => {
    return apiFetch(`/suppliers/${id}`);
};

export const createSupplier = async (data: any) => {
    return apiFetch('/suppliers', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const updateSupplier = async (id: string, data: any) => {
    return apiFetch(`/suppliers/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const deleteSupplier = async (id: string) => {
    return apiFetch(`/suppliers/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
};
