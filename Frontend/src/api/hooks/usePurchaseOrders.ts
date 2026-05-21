import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as poApi from '../endpoints/purchaseOrderApi';
import { toast } from 'react-toastify';

export const usePurchaseOrders = (params?: poApi.GetPurchaseOrdersParams) => {
    return useQuery({
        queryKey: ['purchaseOrders', params],
        queryFn: () => poApi.getAllPurchaseOrders(params)
    });
};

export const usePurchaseOrderByNumber = (poNumber: string) => {
    return useQuery({
        queryKey: ['purchaseOrder', poNumber],
        queryFn: () => poApi.getPurchaseOrderByNumber(poNumber),
        enabled: !!poNumber
    });
};

export const usePurchaseOrderTracking = (poNumber: string) => {
    return useQuery({
        queryKey: ['purchaseOrderTracking', poNumber],
        queryFn: () => poApi.getPurchaseOrderTracking(poNumber),
        enabled: !!poNumber
    });
};

export const usePurchaseOrderTrackerData = (params?: poApi.GetPurchaseOrderTrackerParams) => {
    return useQuery({
        queryKey: ['purchaseOrderTrackerData', params],
        queryFn: () => poApi.getPurchaseOrderTrackerData(params)
    });
};

export const usePurchaseOrderTrackerDetails = (poNumber: string) => {
    return useQuery({
        queryKey: ['purchaseOrderTrackerDetails', poNumber],
        queryFn: () => poApi.getPurchaseOrderTrackerDetails(poNumber),
        enabled: !!poNumber
    });
};

export const useUpdatePurchaseOrderTracking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ poNumber, trackingData }: { poNumber: string; trackingData: any }) => 
            poApi.updatePurchaseOrderTracking(poNumber, trackingData),
        onSuccess: (_, variables) => {
            toast.success('Activity updated successfully');
            queryClient.invalidateQueries({ queryKey: ['purchaseOrder', variables.poNumber] });
            queryClient.invalidateQueries({ queryKey: ['purchaseOrderTrackerDetails', variables.poNumber] });
            queryClient.invalidateQueries({ queryKey: ['purchaseOrderTrackerData'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update activity');
        }
    });
};

export const usePatchPurchaseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ poNumber, updateData }: { poNumber: string; updateData: any }) => 
            poApi.patchPurchaseOrder(poNumber, updateData),
        onSuccess: (data, variables) => {
            toast.success('Purchase order updated successfully');
            queryClient.invalidateQueries({ queryKey: ['purchaseOrder', variables.poNumber] });
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update purchase order');
        }
    });
};
