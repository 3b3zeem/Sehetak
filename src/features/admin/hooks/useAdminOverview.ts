import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

export const useAdminOverview = () => {
  return useQuery({
    queryKey: ['adminOverview'],
    queryFn: () => adminService.getOverviewStats(),
  });
};
