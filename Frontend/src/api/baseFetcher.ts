
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const getHeaders = () => ({
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
});

// --- Helper for authenticated fetch ---
export const apiFetch = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
    const headers: any = {
        ...getHeaders(),
        ...options.headers,
    };

    // For FormData, let the browser set the Content-Type with boundary
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
        credentials: 'include'
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
        const errorData = isJson ? await response.json().catch(() => ({})) : { message: await response.text().catch(() => 'Unknown error') };
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    if (!isJson) {
        return await response.text() as any;
    }

    const result = await response.json();
    
    // If the result is an array, wrap it in the expected { data, total } structure
    if (Array.isArray(result)) {
        return { data: result, total: result.length } as any;
    }

    const isLikelyDetail = result && (
        result.id || result.ProductID || result.productId || 
        result.SKU || result.sku || result.Name || result.name ||
        result.shipmentNumber || result.purchaseOrderId || result.inboundShipmentId ||
        result.orderNumber || result.refNo || result.poNumber
    );
    
    if (result && typeof result === 'object' && !result.data && !isLikelyDetail) {
        const dataKey = [
            'products', 'variants', 'barcodes', 'results', 'items', 
            'purchaseOrders', 'inboundShipments', 'shipments', 'lineItems', 
            'shipmentItems', 'data'
        ].find(key => Array.isArray(result[key]));
        if (dataKey) {
            return { 
                data: result[dataKey], 
                total: result.total || result.count || result[dataKey].length 
            } as any;
        }
    }

    return result;
};

