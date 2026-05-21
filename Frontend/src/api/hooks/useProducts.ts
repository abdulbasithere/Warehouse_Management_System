import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as productApi from '../endpoints/products';

export const useProducts = (params: { page: number; pageSize?: number; search?: string }) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => productApi.getProducts(params),
    });
};

export const useVariants = (params: { page: number; pageSize?: number; search?: string }) => {
    return useQuery({
        queryKey: ['variants', params],
        queryFn: () => productApi.getVariants(params),
    });
};

export const useBarcodes = (params: { page: number; pageSize?: number; search?: string }) => {
    return useQuery({
        queryKey: ['barcodes', params],
        queryFn: () => productApi.getBarcodes(params),
    });
};

export const useProduct = (id: string | undefined) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => productApi.getProduct(id!),
        enabled: !!id,
    });
};

export const useProductInfo = (id: string | undefined) => {
    return useQuery({
        queryKey: ['productInfo', id],
        queryFn: () => productApi.getProductInfo(id!),
        enabled: !!id,
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

export const useBulkCreateVariants = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productApi.bulkCreateVariants,
        onSuccess: () => {
            toast.success('Variants imported successfully');
            queryClient.invalidateQueries({ queryKey: ['variants'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to import variants');
        }
    });
};

export const useBulkCreateBarcodes = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productApi.bulkCreateBarcodes,
        onSuccess: () => {
            toast.success('Barcodes imported successfully');
            queryClient.invalidateQueries({ queryKey: ['barcodes'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to import barcodes');
        }
    });
};

export const useBulkUpdateBarcodeStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ barcodes, isActive }: { barcodes: string[]; isActive: boolean }) => 
            productApi.bulkUpdateBarcodeStatus(barcodes, isActive),
        onSuccess: () => {
            toast.success('Barcodes status updated successfully');
            queryClient.invalidateQueries({ queryKey: ['barcodes'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update barcodes status');
        }
    });
};
