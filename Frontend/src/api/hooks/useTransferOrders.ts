import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as toApi from '../endpoints/transferOrdersApi';

export const useTransferOrders = (search?: string) => {
    return useQuery({
        queryKey: ['transferOrders', search],
        queryFn: () => toApi.getAllTransferOrders(search)
    });
};

export const useTransferOrderById = (id: string | number) => {
    return useQuery({
        queryKey: ['transferOrder', id],
        queryFn: () => toApi.getTransferOrderById(id),
        enabled: !!id,
    });
};

export const useCreateTransferOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: toApi.createTransferOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transferOrders'] });
        }
    });
};

export const useUpdateTransferOrder = (id: string | number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => toApi.updateTransferOrder(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transferOrders'] });
            queryClient.invalidateQueries({ queryKey: ['transferOrder', id] });
        }
    });
};

export const useDeleteTransferOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: toApi.deleteTransferOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transferOrders'] });
        }
    });
};
