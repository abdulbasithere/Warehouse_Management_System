import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as shelfApi from '../endpoints/shelfLocations';

export const useShelfLocations = (params: { page: number; pageSize?: number; search?: string; warehouseId?: string | number }) => {
    return useQuery({
        queryKey: ['shelfLocations', params],
        queryFn: () => shelfApi.fetchShelfLocations(params),
    });
};

export const useShelfLocation = (id?: string) => {
    return useQuery({
        queryKey: ['shelfLocations', id],
        queryFn: () => shelfApi.fetchShelfLocations({ page: 1, pageSize: 1, search: id }),
        enabled: !!id,
        select: (data) => data.data?.[0]
    });
};

export const useCrossDockLocations = () => {
    return useQuery({
        queryKey: ['crossDockLocations'],
        queryFn: shelfApi.fetchCrossDockLocations,
    });
};

export const useCreateShelfLocation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: shelfApi.createShelfLocation,
        onSuccess: () => {
            toast.success('Shelf location created');
            queryClient.invalidateQueries({ queryKey: ['shelfLocations'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create shelf location');
        }
    });
};

export const useUpdateShelfLocation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => shelfApi.updateShelfLocation(id, data),
        onSuccess: () => {
            toast.success('Shelf location updated');
            queryClient.invalidateQueries({ queryKey: ['shelfLocations'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update shelf location');
        }
    });
};

export const useDeleteShelfLocation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: shelfApi.deleteShelfLocation,
        onSuccess: () => {
            toast.success('Shelf location deleted');
            queryClient.invalidateQueries({ queryKey: ['shelfLocations'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete shelf location');
        }
    });
};

export const useBulkCreateShelfLocations = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: shelfApi.bulkCreateShelfLocations,
        onSuccess: () => {
            toast.success('Shelf locations imported');
            queryClient.invalidateQueries({ queryKey: ['shelfLocations'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to import shelf locations');
        }
    });
};
