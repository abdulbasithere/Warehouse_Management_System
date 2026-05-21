import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as warehouseApi from '../endpoints/warehouses';

export const useWarehouses = (params: { search?: string } = {}) => {
    return useQuery({
        queryKey: ['warehouses', params],
        queryFn: () => warehouseApi.fetchWarehouses(params),
    });
};

export const useWarehouse = (id: string | undefined) => {
    return useQuery({
        queryKey: ['warehouse', id],
        queryFn: () => warehouseApi.fetchWarehouseById(id!),
        enabled: !!id && id !== 'new',
    });
};

export const useCreateWarehouse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: warehouseApi.createWarehouse,
        onSuccess: () => {
            toast.success('Warehouse created successfully');
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create warehouse');
        }
    });
};

export const useUpdateWarehouse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => warehouseApi.updateWarehouse(id, data),
        onSuccess: (data) => {
            toast.success('Warehouse updated successfully');
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['warehouse', data.id.toString()] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update warehouse');
        }
    });
};

export const useDeleteWarehouse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: warehouseApi.deleteWarehouse,
        onSuccess: () => {
            toast.success('Warehouse deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete warehouse');
        }
    });
};
