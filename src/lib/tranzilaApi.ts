import crypto from 'node:crypto';

const APP_KEY = process.env.TRANZILA_APP_KEY ?? '';
const SECRET = process.env.TRANZILA_SECRET_KEY ?? '';

export function isTranzilaApiConfigured(): boolean {
  return Boolean(APP_KEY && SECRET);
}

// access_token = HMAC-SHA256(message: app_key, key: secret + time + nonce), hex
function authHeaders(): Record<string, string> {
  const time = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(40).toString('hex');
  const accessToken = crypto
    .createHmac('sha256', SECRET + time + nonce)
    .update(APP_KEY)
    .digest('hex');
  return {
    'Content-Type': 'application/json',
    'X-tranzila-api-app-key': APP_KEY,
    'X-tranzila-api-request-time': time,
    'X-tranzila-api-nonce': nonce,
    'X-tranzila-api-access-token': accessToken,
  };
}

export interface TranzilaTransaction {
  index: string;
  amount: string;
  currency: string;
  processor_response_code: string;
  transtatus: string;
  tranmode: string;
  credit_card_token?: string;
  [key: string]: unknown;
}

export async function getTransaction(
  terminalName: string,
  transactionIndex: number,
): Promise<TranzilaTransaction | null> {
  const res = await fetch('https://api.tranzila.com/v1/transactions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ terminal_name: terminalName, transaction_index: transactionIndex }),
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error('[tranzila] transactions lookup failed', res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { transactions?: TranzilaTransaction[] };
  return data.transactions?.[0] ?? null;
}
