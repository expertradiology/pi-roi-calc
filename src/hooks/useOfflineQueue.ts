import { useState, useEffect, useCallback, useRef } from "react";
import { submitToHubSpot, type LeadFormData } from "../lib/hubspot";
import {
  addLead,
  getAllLeads,
  updateLead,
  removeLead,
  getPendingCount,
  getMirroredCount,
  exportQueueAsCsv,
} from "../lib/queue";

export type SyncState = "online" | "offline" | "syncing" | "failed";

const MAX_RETRIES = 5;
const SYNC_INTERVAL_MS = 60_000;

export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [syncState, setSyncState] = useState<SyncState>("online");
  const [storageWarning, setStorageWarning] = useState(false);
  const syncingRef = useRef(false);

  const refreshCounts = useCallback(async () => {
    try {
      const leads = await getAllLeads();
      const pending = leads.filter((l) => l.syncStatus === "pending" || l.syncStatus === "syncing").length;
      const failed = leads.filter((l) => l.syncStatus === "failed").length;
      setPendingCount(pending);
      setFailedCount(failed);

      // Check for iOS storage eviction
      const mirrored = getMirroredCount();
      if (leads.length === 0 && mirrored > 0) {
        setStorageWarning(true);
      }
    } catch {
      // IndexedDB may be unavailable
    }
  }, []);

  const flushQueue = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncState("syncing");

    try {
      const leads = await getAllLeads();
      const toSync = leads.filter(
        (l) => l.syncStatus === "pending" || l.syncStatus === "failed"
      );

      for (const lead of toSync) {
        // Exponential backoff for previously-failed leads
        if (lead.retryCount > 0) {
          const delay = Math.min(1000 * 2 ** lead.retryCount, 30000);
          await new Promise((r) => setTimeout(r, delay));
        }
        await updateLead(lead.id, { syncStatus: "syncing" });
        try {
          const success = await submitToHubSpot(lead.formData);
          if (success) {
            await removeLead(lead.id);
          } else {
            const newCount = lead.retryCount + 1;
            await updateLead(lead.id, {
              syncStatus: newCount >= MAX_RETRIES ? "failed" : "pending",
              retryCount: newCount,
            });
          }
        } catch {
          const newCount = lead.retryCount + 1;
          await updateLead(lead.id, {
            syncStatus: newCount >= MAX_RETRIES ? "failed" : "pending",
            retryCount: newCount,
          });
        }
      }
    } finally {
      syncingRef.current = false;
      await refreshCounts();
      const remaining = await getPendingCount();
      setSyncState(remaining > 0 ? (navigator.onLine ? "online" : "offline") : "online");
    }
  }, [refreshCounts]);

  const submitLead = useCallback(
    async (formData: LeadFormData): Promise<boolean> => {
      // Try direct submission first
      try {
        const success = await submitToHubSpot(formData);
        if (success) return true;
      } catch {
        // Network error — fall through to queue
      }

      // Queue for later
      await addLead(formData);
      await refreshCounts();
      setSyncState("offline");
      return true; // Still "success" from user's perspective
    },
    [refreshCounts]
  );

  const retryFailed = useCallback(async () => {
    const leads = await getAllLeads();
    for (const lead of leads.filter((l) => l.syncStatus === "failed")) {
      await updateLead(lead.id, { syncStatus: "pending", retryCount: 0 });
    }
    await flushQueue();
  }, [flushQueue]);

  const exportCsv = useCallback(async () => {
    const csv = await exportQueueAsCsv();
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Online/offline listeners
  useEffect(() => {
    const onOnline = () => {
      setSyncState("online");
      flushQueue();
    };
    const onOffline = () => setSyncState("offline");
    const onFocus = () => flushQueue();

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("focus", onFocus);

    // Initial load
    refreshCounts();
    flushQueue();

    // Periodic sync
    const interval = setInterval(() => {
      if (!syncingRef.current) flushQueue();
    }, SYNC_INTERVAL_MS);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [flushQueue, refreshCounts]);

  return {
    pendingCount,
    failedCount,
    syncState,
    storageWarning,
    submitLead,
    retryFailed,
    exportCsv,
  };
}
