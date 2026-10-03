export const TRANZILA_TERMINAL = process.env.TRANZILA_TERMINAL ?? 'sloth';
export const TRANZILA_PASSWORD = process.env.TRANZILA_PASSWORD ?? '';
export const TRANZILA_IFRAME_BASE = 'https://direct.tranzila.com';

/** Israeli VAT rate — applied when prices are pulled pre-VAT from inventory API */
export const VAT_RATE = 0.18;

export function addVat(priceExVat: number): number {
  return priceExVat * (1 + VAT_RATE);
}

export function buildTranzilaIframeUrl(params: {
  orderId: string;
  amount: number;
  successUrl: string;
  failUrl: string;
  notifyUrl: string;
}): string {
  const p = new URLSearchParams({
    supplier: TRANZILA_TERMINAL,
    sum: params.amount.toFixed(2),
    currency: '1',      // ILS
    cred_type: '1',     // regular charge
    TranzilaTK: '1',    // save card token
    nologo: '1',
    tranmode: 'AK',     // authorize + capture
    tranzila_token: params.orderId,
    notify_url_address: params.notifyUrl,
    success_url_address: params.successUrl,
    fail_url_address: params.failUrl,
  });
  return `${TRANZILA_IFRAME_BASE}/${TRANZILA_TERMINAL}/iframenew.php?${p}`;
}
