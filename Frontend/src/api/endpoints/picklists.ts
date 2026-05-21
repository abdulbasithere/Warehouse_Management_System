import { apiFetch, getHeaders } from '../baseFetcher';

export const fetchPickLists = async (params: any) => {
    const query = new URLSearchParams(params);
    return apiFetch(`/picklists?${query}`);
};

export const fetchPickListDetail = async (id: string) => {
    return apiFetch(`/picklists/${id}`);
};

export const createPickList = async (data: any) => {
    return apiFetch('/picklists', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const assignBasket = async (id: string, basket: string, orderNumber?: string) => {
    return apiFetch(`/picklists/${id}/assign-basket`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ basket, orderNumber })
    });
};

export const scanPickItem = async (id: string, sku: string) => {
    return apiFetch(`/picklists/${id}/scan`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ sku })
    });
};

export const completePickList = async (id: string) => {
    return apiFetch(`/picklists/${id}/finalize`, {
        method: 'POST'
    });
};
