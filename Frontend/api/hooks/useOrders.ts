import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as orderApi from '../endpoints/orders';
import { toast } from 'react-toastify';

export const useOrders = (params: { page: number; pageSize?: number; search?: string; status?: string }) => {
    return useQuery({
        queryKey: ['orders', params],
        queryFn: () => orderApi.fetchOrders(params),
    });
};

export const useOrderDetail = (id: string) => {
    return useQuery({
        queryKey: ['orders', id],
        queryFn: () => orderApi.fetchOrderDetail(id),
        enabled: !!id,
    });
};

export const useOrderByNumber = (orderNumber: string) => {
    return useQuery({
        queryKey: ['orders', 'search', orderNumber],
        queryFn: () => orderApi.fetchOrderByNumber(orderNumber),
        enabled: !!orderNumber,
        retry: false,
    });
};

export const useProcessReturn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderNumber: string) => orderApi.processOrderReturn(orderNumber),
        onSuccess: () => {
            toast.success('Return processed successfully');
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['putaways'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to process return');
        }
    });
};

