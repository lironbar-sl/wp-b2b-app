import { useMutation } from '@tanstack/react-query';
import { login, logout as apiLogout, register as apiRegister } from '../../api';
import { useAuthStore } from '../../store';
import type { LoginCredentials, RegisterFormData } from '../../types';

export function useLogin() {
  const setSession = useAuthStore(s => s.setSession);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (session) => {
      setSession(session);
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore(s => s.setSession);

  return useMutation({
    mutationFn: (data: RegisterFormData) => apiRegister(data),
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
