import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/api/auth';
import { queryKeys } from '@/query/queryClient';
import { useAuthStore } from '@/store/authStore';

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: authApi.getMe,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (payload: authApi.UpdateMePayload) => authApi.updateMe(payload),
    onSuccess: (user) => {
      setUser(user);
      qc.setQueryData(queryKeys.me(), user);
    },
  });
}
