import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as putawayApi from '../endpoints/putaway';

export const usePutaways = (params: any) => {
    return useQuery({
        queryKey: ['putaways', params],
        queryFn: () => putawayApi.fetchPutaways(params),
    });
};

export const usePutawayDetail = (id: string) => {
    return useQuery({
        queryKey: ['putaways', id],
        queryFn: () => putawayApi.fetchPutawayDetail(id),
        enabled: !!id,
    });
};

export const useCreatePutaway = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: putawayApi.createPutaway,
        onSuccess: () => {
            toast.success('Putaway created');
            queryClient.invalidateQueries({ queryKey: ['putaways'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create putaway');
        }
    });
};

export const useBulkCreatePutaway = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: putawayApi.bulkCreatePutaway,
        onSuccess: () => {
            toast.success('Bulk putaways created');
            queryClient.invalidateQueries({ queryKey: ['putaways'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create bulk putaways');
        }
    });
};

export const useAssignPickerToPutaway = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: putawayApi.assignPicker,
        onSuccess: () => {
            toast.success('Picker assigned to putaway');
            queryClient.invalidateQueries({ queryKey: ['putaways'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to assign picker');
        }
    });
};

export const useScanPutawayItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, sku, shelf }: { id: string; sku: string; shelf: string }) => putawayApi.scanPutawayItem(id, sku, shelf),
        onSuccess: (_, { id }) => {
            toast.success('Item scanned');
            queryClient.invalidateQueries({ queryKey: ['putaways', id] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Scan failed');
        }
    });
};

export const useCompletePutaway = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, scans }: { id: string; scans: { shelfId: string; quantity: number }[] }) => putawayApi.completePutaway(id, scans),
        onSuccess: (_, { id }) => {
            toast.success('Putaway completed');
            queryClient.invalidateQueries({ queryKey: ['putaways', id] });
            queryClient.invalidateQueries({ queryKey: ['putaways'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Completion failed');
        }
    });
};
