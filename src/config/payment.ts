export const TRANZILA_TERMINAL = process.env.TRANZILA_TERMINAL ?? '';
export const TRANZILA_IFRAME_BASE = 'https://directng.tranzila.com';

/** Israeli VAT rate — applied when prices are pulled pre-VAT from inventory API */
export const VAT_RATE = 0.18;

export function addVat(priceExVat: number): number {
  return priceExVat * (1 + VAT_RATE);
}

export interface TranzilaCustomer {
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  businessId?: string;
}

/** Fields to POST into the Tranzila iframe (DirectNG iframenew.php). */
export function buildTranzilaIframeRequest(params: {
  amount: number;
  successUrl: string;
  failUrl: string;
  notifyUrl: string;
  customer: TranzilaCustomer;
  description?: string;
}): { action: string; fields: Record<string, string> } {
  const c = params.customer;
  const fields: Record<string, string> = {
    sum: params.amount.toFixed(2),
    currency: '1',
    tranmode: 'A',
    cred_type: '1',
    lang: 'il',
    nologo: '1',
    success_url_address: params.successUrl,
    fail_url_address: params.failUrl,
    notify_url_address: params.notifyUrl,
    company: c.company ?? '',
    contact: c.contact ?? '',
    email: c.email ?? '',
    phone: c.phone ?? '',
    address: c.address ?? '',
    city: c.city ?? '',
    country: 'Israel',
    zip: '',
  };
  if (c.businessId) fields.business_id = c.businessId;
  if (params.description) fields.pdesc = params.description.slice(0, 250);

  return {
    action: `${TRANZILA_IFRAME_BASE}/${TRANZILA_TERMINAL}/iframenew.php`,
    fields,
  };
}
