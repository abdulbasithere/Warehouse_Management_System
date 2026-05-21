import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as supplierApi from '../endpoints/suppliers';

export const useSuppliers = () => {
    return useQuery({
        queryKey: ['suppliers'],
        queryFn: supplierApi.fetchSuppliers,
    });
};

export const useSupplier = (id: string | undefined) => {
    return useQuery({
        queryKey: ['supplier', id],
        queryFn: () => supplierApi.fetchSupplierById(id!),
        enabled: !!id && id !== 'new',
    });
};

export const useCreateSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: supplierApi.createSupplier,
        onSuccess: () => {
            toast.success('Supplier created successfully');
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create supplier');
        }
    });
};

export const useUpdateSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => supplierApi.updateSupplier(id, data),
        onSuccess: (data) => {
            toast.success('Supplier updated successfully');
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            queryClient.invalidateQueries({ queryKey: ['supplier', data.SupplierID] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update supplier');
        }
    });
};

export const useDeleteSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: supplierApi.deleteSupplier,
        onSuccess: () => {
            toast.success('Supplier deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete supplier');
        }
    });
};
