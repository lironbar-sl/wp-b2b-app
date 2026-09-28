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

// Survive Next.js hot reloads in dev
declare global {
  var __dispatchJobs: Map<string, DispatchJob> | undefined;
}
if (!global.__dispatchJobs) global.__dispatchJobs = new Map();

export const jobs = global.__dispatchJobs;

export function getJobByOrderId(orderId: string): DispatchJob | undefined {
  for (const job of jobs.values()) {
    if (job.orderId === orderId) return job;
  }
  return undefined;
}
