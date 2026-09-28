import { mockRequest } from './client';
import { MOCK_USERS } from './mockData';
import type { AuthSession, LoginCredentials } from '../types';

// Demo password for all mock accounts
const DEMO_PASSWORD = 'password123';

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  return mockRequest(
    () => {
      const user = MOCK_USERS.find(
        u => u.email.toLowerCase() === credentials.email.toLowerCase(),
      );

      if (!user || credentials.password !== DEMO_PASSWORD) {
        throw {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password. Please try again.',
        };
      }

      const session: AuthSession = {
        user,
        token: `mock-jwt-${user.id}-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      return session;
    },
    { delayMs: 900, errorRate: 0 }, // No random errors on login — explicit failure only
  );
}

export async function refreshSession(token: string): Promise<AuthSession> {
  return mockRequest(() => {
    const userId = token.split('-')[2];
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) throw { code: 'AUTH_SESSION_EXPIRED', message: 'Session expired. Please sign in again.' };

    return {
      user,
      token: `mock-jwt-${user.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}

export async function logout(): Promise<void> {
  // TODO (manager/admin): Invalidate server-side session here
  return mockRequest(() => undefined, { delayMs: 300 });
}
