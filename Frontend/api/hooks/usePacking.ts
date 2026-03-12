import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as packingApi from '../endpoints/packing';

export const usePackingQueue = (params: any) => {
    return useQuery({
        queryKey: ['packingQueue', params],
        queryFn: () => packingApi.fetchPackingQueue(params),
    });
};

export const usePackingJob = (so: string) => {
    return useQuery({
        queryKey: ['packingJob', so],
        queryFn: () => packingApi.fetchPackingJobBySaleOrder(so),
        enabled: !!so,
    });
};

export const useScanPackItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ so, sku }: { so: string; sku: string }) => packingApi.scanPackItem(so, sku),
        onSuccess: (_, { so }) => {
            toast.success('Item scanned');
            queryClient.invalidateQueries({ queryKey: ['packingJob', so] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Scan failed');
        }
    });
};

export const useCompletePacking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: packingApi.completePacking,
        onSuccess: (_, so) => {
            toast.success('Packing completed');
            queryClient.invalidateQueries({ queryKey: ['packingJob', so] });
            queryClient.invalidateQueries({ queryKey: ['packingQueue'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to complete packing');
        }
    });
};

export const useBasketPacking = (basket: string) => {
    return useQuery({
        queryKey: ['basketPacking', basket],
        queryFn: () => packingApi.fetchBasketPacking(basket),
        enabled: !!basket,
    });
};

export const useCompleteBasketPacking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: packingApi.completeBasketPacking,
        onSuccess: (_, basket) => {
            toast.success('Basket packing completed');
            queryClient.invalidateQueries({ queryKey: ['basketPacking', basket] });
            queryClient.invalidateQueries({ queryKey: ['packingQueue'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to complete basket packing');
        }
    });
};

export const useScanBasketItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ basket, sku }: { basket: string; sku: string }) => packingApi.scanBasketItem(basket, sku),
        onSuccess: (_, { basket }) => {
            toast.success('Item scanned');
            queryClient.invalidateQueries({ queryKey: ['basketPacking', basket] });
            queryClient.invalidateQueries({ queryKey: ['packingQueue'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Scan failed');
        }
    });
};
