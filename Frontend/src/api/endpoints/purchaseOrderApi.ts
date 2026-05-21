import { apiFetch, getHeaders } from '../baseFetcher';

export interface GetPurchaseOrdersParams {
    page?: number;
    pageSize?: number;
    purchaseOrderId?: string;
    createdDate?: string;
    warehouseName?: string;
    vendorName?: string;
}

export const getAllPurchaseOrders = async (params?: GetPurchaseOrdersParams) => {
    const searchParams = new URLSearchParams();
    searchParams.append('_t', Date.now().toString());
    
    if (params) {
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.purchaseOrderId) searchParams.append('purchaseOrderId', params.purchaseOrderId);
        if (params.createdDate) searchParams.append('createdDate', params.createdDate);
        if (params.warehouseName) searchParams.append('warehouseName', params.warehouseName);
        if (params.vendorName) searchParams.append('vendorName', params.vendorName);
    }
    
    const url = `/purchase-orders?${searchParams.toString()}`;
    return apiFetch(url);
};

export const getPurchaseOrderByNumber = async (poNumber: string) => {
    return apiFetch(`/purchase-orders/${poNumber}`);
};

export const getPurchaseOrderTracking = async (poNumber: string) => {
    return apiFetch(`/purchase-orders/${poNumber}/tracking`);
};

export interface GetPurchaseOrderTrackerParams {
    page?: number;
    pageSize?: number;
    search?: string;
    date?: string;
    trackerStatus?: string;
}

export const getPurchaseOrderTrackerData = async (params?: GetPurchaseOrderTrackerParams) => {
    const searchParams = new URLSearchParams();
    searchParams.append('_t', Date.now().toString());
    
    if (params) {
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.date) searchParams.append('date', params.date);
        if (params.trackerStatus) searchParams.append('trackerStatus', params.trackerStatus);
    }
    
    const url = `/purchase-orders/tracker/data?${searchParams.toString()}`;
    return apiFetch(url);
};

export const getPurchaseOrderTrackerDetails = async (poNumber: string) => {
    return apiFetch(`/purchase-orders/tracker/details/${poNumber}`);
};

export const updatePurchaseOrderTracking = async (poNumber: string, trackingData: any) => {
    return apiFetch(`/purchase-orders/${poNumber}/activities`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(trackingData)
    });
};

export const updatePurchaseOrderStatus = async (poNumber: string, status: string) => {
    return apiFetch(`/purchase-orders/${poNumber}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
    });
};

export const patchPurchaseOrder = async (poNumber: string, updateData: any) => {
    return apiFetch(`/purchase-orders/${poNumber}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updateData)
    });
};

export const uploadCrossDockPlan = async (file: File, shipmentNumber: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('shipmentNumber', shipmentNumber);

    return apiFetch('/inbound-shipments/upload-cross-dock-plan', {
        method: 'POST',
        body: formData
    });
};
