import { apiFetch } from '../baseFetcher';

export const fetchOrders = async (params: { page: number; pageSize?: number; search?: string; status?: string }) => {
    const query = new URLSearchParams({
        page: params.page.toString(),
        pageSize: (params.pageSize || 10).toString(),
        search: params.search || '',
        status: params.status || ''
    });
    return apiFetch(`/orders?${query}`);
};

export const fetchOrderDetail = async (id: string) => {
    return apiFetch(`/orders/${id}`);
};

export const fetchOrderByNumber = async (orderNumber: string) => {
    return apiFetch(`/orders/search/${orderNumber}`);
};

export const processOrderReturn = async (orderNumber: string) => {
    return apiFetch(`/orders/${orderNumber}/return`, {
        method: 'POST'
    });
};
