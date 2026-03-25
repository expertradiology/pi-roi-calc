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
    roi_net_annual_gain?: number;
    roi_percentage?: number;
    roi_value_per_case?: number;
  };
  syncStatus: "pending" | "syncing" | "synced" | "failed";
  retryCount: number;
}

const QUEUE_PREFIX = "lead_";
const COUNT_KEY = "queue_count";
const LS_BACKUP_KEY = "lead_backup";

function leadKey(id: string) {
  return QUEUE_PREFIX + id;
}

function generateId(): string {
  return crypto.randomUUID();
}

// ── localStorage full backup ──────────────────────────────────────
// Mirrors ALL lead data (not just count) to localStorage as a JSON array.
// localStorage survives iOS storage eviction that can wipe IndexedDB.
function mirrorAllToLocalStorage(leads: QueuedLead[]): void {
  try {
    localStorage.setItem(LS_BACKUP_KEY, JSON.stringify(leads));
    localStorage.setItem(COUNT_KEY, String(leads.filter((l) => l.syncStatus !== "synced").length));
  } catch {
    // localStorage full or unavailable — best effort
  }
}

function getLocalStorageBackup(): QueuedLead[] {
  try {
    const raw = localStorage.getItem(LS_BACKUP_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedLead[];
  } catch {
    return [];
  }
}

// ── Core operations ───────────────────────────────────────────────

export async function addLead(formData: QueuedLead["formData"]): Promise<QueuedLead> {
  const lead: QueuedLead = {
    id: generateId(),
    timestamp: Date.now(),
    formData,
    syncStatus: "pending",
    retryCount: 0,
  };

  // Write to IndexedDB
  await set(leadKey(lead.id), lead);

  // Immediately mirror to localStorage backup
  const all = await getAllLeads();
  mirrorAllToLocalStorage(all);

  return lead;
}

export async function getAllLeads(): Promise<QueuedLead[]> {
  let leads: QueuedLead[] = [];

  try {
    const allEntries = await entries();
    leads = allEntries
      .filter(([key]) => String(key).startsWith(QUEUE_PREFIX))
      .map(([, value]) => value as QueuedLead)
      .sort((a, b) => a.timestamp - b.timestamp);
  } catch {
    // IndexedDB failed — fall through to localStorage recovery
  }

  // If IndexedDB is empty but localStorage has data, iOS evicted IndexedDB.
  // Restore from localStorage backup.
  if (leads.length === 0) {
    const backup = getLocalStorageBackup();
    if (backup.length > 0) {
      // Restore to IndexedDB
      for (const lead of backup) {
        try {
          await set(leadKey(lead.id), lead);
        } catch {
          // IndexedDB may be completely broken — we still have localStorage
        }
      }
      return backup.sort((a, b) => a.timestamp - b.timestamp);
    }
  }

  return leads;
}

export async function updateLead(id: string, updates: Partial<QueuedLead>): Promise<void> {
  const lead = (await get(leadKey(id))) as QueuedLead | undefined;
  if (lead) {
    await set(leadKey(id), { ...lead, ...updates });
    const all = await getAllLeads();
    mirrorAllToLocalStorage(all);
  }
}

export async function removeLead(id: string): Promise<void> {
  await del(leadKey(id));
  const all = await getAllLeads();
  mirrorAllToLocalStorage(all);
}

export async function getPendingCount(): Promise<number> {
  const leads = await getAllLeads();
  return leads.filter((l) => l.syncStatus !== "synced").length;
}

export function getMirroredCount(): number {
  try {
    return parseInt(localStorage.getItem(COUNT_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

// ── Recover stuck leads ───────────────────────────────────────────
// If app crashed mid-sync, leads get stuck in "syncing" state forever.
// Call this on startup to reset them back to "pending".
export async function recoverStuckLeads(): Promise<number> {
  const leads = await getAllLeads();
  let recovered = 0;
  for (const lead of leads) {
    if (lead.syncStatus === "syncing") {
      await updateLead(lead.id, { syncStatus: "pending" });
      recovered++;
    }
  }
  return recovered;
}

// ── CSV export ────────────────────────────────────────────────────

export async function exportQueueAsCsv(): Promise<string> {
  const leads = await getAllLeads();
  if (leads.length === 0) return "";
  const headers =
    "timestamp,firstname,lastname,email,phone,company,company_type,state,roi_net_annual_gain,roi_percentage,roi_value_per_case,syncStatus,retryCount\n";
  const rows = leads
    .map((l) =>
      [
        new Date(l.timestamp).toISOString(),
        l.formData.firstname,
        l.formData.lastname,
        l.formData.email,
        l.formData.phone,
        l.formData.company,
        l.formData.company_type,
        l.formData.state,
        l.formData.roi_net_annual_gain ?? "",
        l.formData.roi_percentage ?? "",
        l.formData.roi_value_per_case ?? "",
        l.syncStatus,
        l.retryCount,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  return headers + rows;
}
