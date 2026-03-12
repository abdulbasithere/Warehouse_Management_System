import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as productApi from '../endpoints/products';

export const useProducts = (params: { page: number; pageSize?: number; search?: string }) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => productApi.fetchProducts(params),
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productApi.createProduct,
        onSuccess: () => {
            toast.success('Product created successfully');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create product');
        }
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => productApi.updateProduct(id, data),
        onSuccess: () => {
            toast.success('Product updated successfully');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update product');
        }
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productApi.deleteProduct,
        onSuccess: () => {
            toast.success('Product deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete product');
        }
    });
};

export const useBulkDeleteProducts = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productApi.bulkDeleteProducts,
        onSuccess: () => {
            toast.success('Products deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete products');
        }
    });
};

export const useBulkCreateProducts = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productApi.bulkCreateProducts,
        onSuccess: () => {
            toast.success('Products imported successfully');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to import products');
        }
    });
};
