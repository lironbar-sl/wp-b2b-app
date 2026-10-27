import { kvGet, kvSet, kvSetIfAbsent } from '@/lib/kv';

export interface DispatchJob {
  orderId: string;
  orderNumber: string;
  itemCount: number;
  totalAmount: number;
  courierName: string | null;
  courierPhone: string | null;
  etaMinutes: number | null;
  acceptedAt: string | null;
  createdAt: string;
}

const jobKey = (token: string) => `dispatch:job:${token}`;
const orderKey = (orderId: string) => `dispatch:order:${orderId}`;
const acceptKey = (token: string) => `dispatch:accepted:${token}`;

/** Creates a job for the order. Returns null if the order was already dispatched. */
export async function createJob(token: string, job: DispatchJob): Promise<boolean> {
  const claimed = await kvSetIfAbsent(orderKey(job.orderId), token);
  if (!claimed) return false;
  await kvSet(jobKey(token), job);
  return true;
}

export const getJob = (token: string) => kvGet<DispatchJob>(jobKey(token));

export async function getJobByOrderId(orderId: string): Promise<DispatchJob | null> {
  const token = await kvGet<string>(orderKey(orderId));
  return token ? getJob(token) : null;
}

/** First courier to call this wins; later calls return null. */
export async function acceptJob(token: string, courierName: string, etaMinutes: number): Promise<DispatchJob | null> {
  const job = await getJob(token);
  if (!job) return null;
  const won = await kvSetIfAbsent(acceptKey(token), courierName);
  if (!won) return null;
  const accepted = { ...job, courierName, etaMinutes, acceptedAt: new Date().toISOString() };
  await kvSet(jobKey(token), accepted);
  return accepted;
}
