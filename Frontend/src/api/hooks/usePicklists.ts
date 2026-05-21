import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as picklistApi from '../endpoints/picklists';

export const usePickLists = (params: any) => {
    return useQuery({
        queryKey: ['picklists', params],
        queryFn: () => picklistApi.fetchPickLists(params),
    });
};

export const usePickListDetail = (id: string) => {
    return useQuery({
        queryKey: ['picklists', id],
        queryFn: () => picklistApi.fetchPickListDetail(id),
        enabled: !!id,
    });
};

export const useCreatePickList = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: picklistApi.createPickList,
        onSuccess: () => {
            toast.success('Pick list created');
            queryClient.invalidateQueries({ queryKey: ['picklists'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create pick list');
        }
    });
};

export const useAssignBasket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, basket, orderNumber }: { id: string; basket: string; orderNumber?: string }) =>
            picklistApi.assignBasket(id, basket, orderNumber),
        onSuccess: (_, { id }) => {
            toast.success('Basket assigned');
            queryClient.invalidateQueries({ queryKey: ['picklists', id] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to assign basket');
        }
    });
};

export const useScanPickItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, sku }: { id: string; sku: string }) => picklistApi.scanPickItem(id, sku),
        onSuccess: (_, { id }) => {
            toast.success('Item scanned');
            queryClient.invalidateQueries({ queryKey: ['picklists', id] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Scan failed');
        }
    });
};

export const useCompletePickList = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: picklistApi.completePickList,
        onSuccess: (_, id) => {
            toast.success('Pick list completed');
            queryClient.invalidateQueries({ queryKey: ['picklists', id] });
            queryClient.invalidateQueries({ queryKey: ['picklists'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to complete pick list');
        }
    });
};
