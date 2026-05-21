import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../endpoints/inboundShipments';

export const useInboundShipments = (params?: api.GetInboundShipmentsParams) => {
    return useQuery({
        queryKey: ['inboundShipments', params],
        queryFn: () => api.getAllInboundShipments(params),
    });
};

export const useInboundShipmentDetail = (id: string) => {
    return useQuery({
        queryKey: ['inboundShipment', id],
        queryFn: () => api.getInboundShipmentDetail(id),
        enabled: !!id,
    });
};

export const useCreateInboundShipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createInboundShipment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inboundShipments'] });
        }
    });
};
export const useUpdateInboundShipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.updateInboundShipment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inboundShipments'] });
            queryClient.invalidateQueries({ queryKey: ['inboundShipment'] });
        }
    });
};

export const useCrossDockLines = (shipmentNumber: string) => {
    return useQuery({
        queryKey: ['crossDockLines', shipmentNumber],
        queryFn: () => api.getCrossDockLines(shipmentNumber),
        enabled: !!shipmentNumber,
        staleTime: 0,            
        gcTime: 0,             
        refetchOnMount: 'always',
    });
};

export const useParkInboundShipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.parkInboundShipment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inboundShipments'] });
            queryClient.invalidateQueries({ queryKey: ['inboundShipment'] });
        }
    });
};

export const usePutScannedItem = () => {
    return useMutation({
        mutationFn: api.putScannedItem
    });
};

export const useUpdateQuantities = () => {
    return useMutation({
        mutationFn: api.updateQuantities
    });
};

export const useProcessCrossDockPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.processCrossDockPlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inboundShipments'] });
            queryClient.invalidateQueries({ queryKey: ['inboundShipment'] });
        }
    });
};

export const useCreateCrossDockTransferOrders = () => {
  const queryClient = useQueryClient();
  return useMutation({
      mutationFn: api.createCrossDockTransferOrders,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['transferOrders'] });
          queryClient.invalidateQueries({ queryKey: ['purchaseOrder'] });
      }
  });
};
