import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { toast } from 'sonner';

export const useAdminMedications = (search: string = '') => {
  const queryClient = useQueryClient();

  const medicationsQuery = useQuery({
    queryKey: ['adminMedications', search],
    queryFn: () => adminService.getGlobalMedications(search),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMedications'] });
      toast.success('Medication deleted by admin');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Delete error');
    },
  });

  return {
    medications: medicationsQuery.data,
    isLoading: medicationsQuery.isLoading,
    deleteMutation,
  };
};
