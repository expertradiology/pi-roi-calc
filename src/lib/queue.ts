import { get, set, del, entries } from "idb-keyval";

export interface QueuedLead {
  id: string;
  timestamp: number;
  formData: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    company: string;
    company_type: string;
    state: string;
  };
  syncStatus: "pending" | "syncing" | "synced" | "failed";
  retryCount: number;
}

const QUEUE_PREFIX = "lead_";
const COUNT_KEY = "queue_count";

function leadKey(id: string) {
  return QUEUE_PREFIX + id;
}

function generateId(): string {
  return crypto.randomUUID();
}

export async function addLead(formData: QueuedLead["formData"]): Promise<QueuedLead> {
  const lead: QueuedLead = {
    id: generateId(),
    timestamp: Date.now(),
    formData,
    syncStatus: "pending",
    retryCount: 0,
  };
  await set(leadKey(lead.id), lead);
  await mirrorCount();
  return lead;
}

export async function getAllLeads(): Promise<QueuedLead[]> {
  const allEntries = await entries();
  return allEntries
    .filter(([key]) => String(key).startsWith(QUEUE_PREFIX))
    .map(([, value]) => value as QueuedLead)
    .sort((a, b) => a.timestamp - b.timestamp);
}

export async function updateLead(id: string, updates: Partial<QueuedLead>): Promise<void> {
  const lead = await get(leadKey(id)) as QueuedLead | undefined;
  if (lead) {
    await set(leadKey(id), { ...lead, ...updates });
    await mirrorCount();
  }
}

export async function removeLead(id: string): Promise<void> {
  await del(leadKey(id));
  await mirrorCount();
}

export async function getPendingCount(): Promise<number> {
  const leads = await getAllLeads();
  return leads.filter((l) => l.syncStatus !== "synced").length;
}

async function mirrorCount(): Promise<void> {
  const count = await getPendingCount();
  try {
    localStorage.setItem(COUNT_KEY, String(count));
  } catch {
    // localStorage may be unavailable
  }
}

export function getMirroredCount(): number {
  try {
    return parseInt(localStorage.getItem(COUNT_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

export async function exportQueueAsCsv(): Promise<string> {
  const leads = await getAllLeads();
  if (leads.length === 0) return "";
  const headers = "timestamp,firstname,lastname,email,phone,company,company_type,state,syncStatus\n";
  const rows = leads.map((l) =>
    [
      new Date(l.timestamp).toISOString(),
      l.formData.firstname,
      l.formData.lastname,
      l.formData.email,
      l.formData.phone,
      l.formData.company,
      l.formData.company_type,
      l.formData.state,
      l.syncStatus,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  ).join("\n");
  return headers + rows;
}
