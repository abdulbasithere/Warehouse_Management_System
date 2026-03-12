import { apiFetch, getHeaders } from '../baseFetcher';

export const fetchPackingQueue = async (params: any) => {
    const query = new URLSearchParams(params);
    return apiFetch(`/packing/queue?${query}`);
};

export const fetchPackingJobBySaleOrder = async (so: string) => {
    return apiFetch(`/packing/job/${so}`);
};

export const scanPackItem = async (so: string, sku: string) => {
    return apiFetch(`/packing/job/${so}/scan`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ sku })
    });
};

export const completePacking = async (so: string) => {
    return apiFetch(`/packing/job/${so}/complete`, {
        method: 'POST'
    });
};

export const fetchBasketPacking = async (basket: string) => {
    return apiFetch(`/packing/basket/${basket}`);
};

export const completeBasketPacking = async (basket: string) => {
    return apiFetch(`/packing/basket/${basket}/complete`, {
        method: 'POST'
    });
};

export const scanBasketItem = async (basket: string, sku: string) => {
    return apiFetch(`/packing/basket/${basket}/scan`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ sku })
    });
};
