import { useMutation } from '@tanstack/react-query';
import { login, logout as apiLogout } from '../../api';
import { useAuthStore } from '../../store';
import type { LoginCredentials } from '../../types';

export function useLogin() {
  const setSession = useAuthStore(s => s.setSession);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (session) => {
      setSession(session);
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore(s => s.clearSession);

  return useMutation({
    mutationFn: () => apiLogout(),
    onSuccess: () => {
      clearSession();
    },
    onError: () => {
      // Clear locally even if server call fails
      clearSession();
    },
  });
}
