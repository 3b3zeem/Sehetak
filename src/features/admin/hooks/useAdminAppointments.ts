import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

export const useAdminAppointments = () => {
  const appointmentsQuery = useQuery({
    queryKey: ['adminAppointments'],
    queryFn: () => adminService.getGlobalAppointments(),
  });

  return {
    appointments: appointmentsQuery.data,
    isLoading: appointmentsQuery.isLoading,
  };
};
