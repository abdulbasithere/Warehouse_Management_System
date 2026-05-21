import { apiFetch, getHeaders } from '../baseFetcher';

export interface GetInboundShipmentsParams {
    page?: number;
    pageSize?: number;
    search?: string;
    date?: string;
    purchaseOrderId?: string;
    shipmentNumber?: string;
}

export const getAllInboundShipments = async (params?: GetInboundShipmentsParams) => {
    const searchParams = new URLSearchParams();
    searchParams.append('_t', Date.now().toString());
    
    if (params) {
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.date) searchParams.append('date', params.date);
        if (params.purchaseOrderId) searchParams.append('purchaseOrderId', params.purchaseOrderId);
        if (params.shipmentNumber) searchParams.append('shipmentNumber', params.shipmentNumber);
    }

    const url = `/inbound-shipments?${searchParams.toString()}`;
    return apiFetch(url, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
};

export const getInboundShipmentDetail = async (id: string) => {
    return apiFetch(`/inbound-shipments/${id}?_t=${Date.now()}`, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
};

export const createInboundShipment = async (data: any) => {
    return apiFetch('/inbound-shipments', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};
export const updateInboundShipment = async (id: string, data: any) => {
    return apiFetch(`/inbound-shipments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const getCrossDockLines = async (shipmentNumber: string) => {
    return apiFetch(`/cross-dock/lines/${shipmentNumber}?_t=${Date.now()}`, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
};

export const syncCrossDockLines = async (shipmentNumber: string, lines: any[]) => {
    return apiFetch(`/cross-dock/lines/${shipmentNumber}/sync`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ lines })
    });
};

export const parkInboundShipment = async (data: any) => {
    return apiFetch('/inbound-shipments/park', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const putScannedItem = async (data: any) => {
    return apiFetch('/cross-dock/scan', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const updateQuantities = async (data: any) => {
    return apiFetch('/cross-dock/planned-quantity', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const processCrossDockPlan = async (shipmentNumber: string) => {
    return apiFetch('/inbound-shipments/process-cross-dock-plan', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ shipmentNumber })
    });
};

export const createCrossDockTransferOrders = async (purchaseOrderId: string) => {
    return apiFetch('/inbound-shipments/create-cross-dock-transfer-orders', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ purchaseOrderId })
    });
};
