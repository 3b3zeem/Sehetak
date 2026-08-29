import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { toast } from 'sonner';

export const useAdminUsers = (search: string = '') => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['adminUsers', search],
    queryFn: () => adminService.getUsers(search),
  });

  const toggleRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: 'patient' | 'admin' }) =>
      adminService.updateUserRole(userId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User role updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Role update error');
    },
  });

  return {
    users: usersQuery.data,
    isLoading: usersQuery.isLoading,
    toggleRoleMutation,
  };
};
