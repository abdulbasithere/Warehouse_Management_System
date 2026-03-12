import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as userApi from '../endpoints/users';

export const useUsers = (params?: { search?: string; role?: string }) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => userApi.fetchUsers(params),
    });
};

export const usePickers = () => {
    return useQuery({
        queryKey: ['users', 'pickers'],
        queryFn: () => userApi.fetchPickers(),
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: userApi.createUser,
        onSuccess: () => {
            toast.success('User created successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create user');
        }
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => userApi.updateUser(id, data),
        onSuccess: () => {
            toast.success('User updated successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update user');
        }
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: userApi.deleteUser,
        onSuccess: () => {
            toast.success('User deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete user');
        }
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: ({ id, pass }: { id: string; pass: string }) => userApi.resetPassword(id, pass),
        onSuccess: () => {
            toast.success('Password reset successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to reset password');
        }
    });
};
