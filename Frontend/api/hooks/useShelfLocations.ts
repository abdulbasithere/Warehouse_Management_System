import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as shelfApi from '../endpoints/shelfLocations';

export const useShelfLocations = (params: { page: number; pageSize?: number; search?: string }) => {
    return useQuery({
        queryKey: ['shelfLocations', params],
        queryFn: () => shelfApi.fetchShelfLocations(params),
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
