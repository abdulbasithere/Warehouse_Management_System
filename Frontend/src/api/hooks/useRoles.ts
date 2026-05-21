import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as roleApi from '../endpoints/roles';

export const useRoles = () => {
    return useQuery({
        queryKey: ['roles'],
        queryFn: roleApi.fetchRoles,
    });
};

export const useRole = (id: string | undefined) => {
    return useQuery({
        queryKey: ['role', id],
        queryFn: () => roleApi.fetchRoleById(id!),
        enabled: !!id && id !== 'new',
    });
};

export const useCreateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: roleApi.createRole,
        onSuccess: () => {
            toast.success('Role created successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create role');
        }
    });
};

export const useUpdateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => roleApi.updateRole(id, data),
        onSuccess: (data) => {
            toast.success('Role updated successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['role', data.id] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update role');
        }
    });
};

export const useDeleteRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: roleApi.deleteRole,
        onSuccess: () => {
            toast.success('Role deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete role');
        }
    });
};
