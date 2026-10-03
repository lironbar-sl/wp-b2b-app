import { mockRequest } from './client';
import { MOCK_USERS } from './mockData';
import type { AuthSession, LoginCredentials, RegisterFormData } from '../types';

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

export async function register(data: RegisterFormData): Promise<AuthSession> {
  return mockRequest(
    () => {
      const existing = MOCK_USERS.find(
        u => u.email.toLowerCase() === data.email.toLowerCase(),
      );
      if (existing) {
        throw { code: 'AUTH_EMAIL_TAKEN', message: 'כתובת המייל כבר רשומה במערכת.' };
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.businessName,
        role: 'customer' as const,
        createdAt: new Date().toISOString(),
        phone: data.phone,
        businessType: data.businessType,
        businessId: data.businessId,
        deliveryAddress: data.deliveryAddress,
        deliveryCity: data.deliveryCity,
      };

      // In a real system this would POST to the neworderapi Customers endpoint
      // and persist the user. For now we store locally so the session is usable.
      MOCK_USERS.push(newUser);

      return {
        user: newUser,
        token: `mock-jwt-${newUser.id}-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      } satisfies AuthSession;
    },
    { delayMs: 1100, errorRate: 0 },
  );
}

export async function logout(): Promise<void> {
  // TODO (manager/admin): Invalidate server-side session here
  return mockRequest(() => undefined, { delayMs: 300 });
}
