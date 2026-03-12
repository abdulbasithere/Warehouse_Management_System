import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as inventoryApi from '../endpoints/inventory';

export const useAdjustmentHistory = (params: { page: number; pageSize?: number }) => {
    return useQuery({
        queryKey: ['inventory-adjustments', params],
        queryFn: () => inventoryApi.fetchAdjustmentHistory(params),
    });
};

export const useCreateAdjustment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: inventoryApi.createAdjustment,
        onSuccess: () => {
            toast.success('Inventory adjusted successfully');
            queryClient.invalidateQueries({ queryKey: ['inventory-adjustments'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['shelf-locations'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to adjust inventory');
        }
    });
};
