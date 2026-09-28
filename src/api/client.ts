/**
 * Mock API client — simulates realistic network latency and error conditions.
 * Replace with a real HTTP client (axios/fetch) when connecting to a backend.
 *
 * TODO (manager/admin): When building the back office, configure role-based
 * endpoints here and add an Authorization header from the session token.
 */

const DEFAULT_DELAY_MS = 600;
const SLOW_DELAY_MS = 1200;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Simulate a network call. Rejects with an API-shaped error ~5% of the time. */
export async function mockRequest<T>(
  dataFn: () => T,
  options: { delayMs?: number; errorRate?: number } = {},
): Promise<T> {
  const { delayMs = DEFAULT_DELAY_MS, errorRate = 0.05 } = options;
  await delay(delayMs);

  if (Math.random() < errorRate) {
    throw {
      code: 'NETWORK_ERROR',
      message: 'A network error occurred. Please try again.',
    };
  }

  return dataFn();
}

export async function mockSlowRequest<T>(dataFn: () => T): Promise<T> {
  return mockRequest(dataFn, { delayMs: SLOW_DELAY_MS });
}
