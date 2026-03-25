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
  recoverStuckLeads,
} from "../lib/queue";

export type SyncState = "online" | "offline" | "syncing" | "failed";

const MAX_RETRIES = 10; // increased from 5 — we really don't want to give up
const SYNC_INTERVAL_MS = 30_000; // check every 30s instead of 60s

export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [syncState, setSyncState] = useState<SyncState>("online");
  const [storageWarning, setStorageWarning] = useState(false);
  const syncingRef = useRef(false);

  const refreshCounts = useCallback(async () => {
    try {
      const leads = await getAllLeads();
      const pending = leads.filter(
        (l) => l.syncStatus === "pending" || l.syncStatus === "syncing"
      ).length;
      const failed = leads.filter((l) => l.syncStatus === "failed").length;
      setPendingCount(pending);
      setFailedCount(failed);

      // Check for iOS storage eviction — getAllLeads now auto-recovers,
      // but warn if localStorage also lost data
      const mirrored = getMirroredCount();
      if (leads.length === 0 && mirrored > 0) {
        setStorageWarning(true);
      }
    } catch {
      // IndexedDB may be unavailable
    }
  }, []);

  const flushQueue = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setSyncState("syncing");

    try {
      const leads = await getAllLeads();
      const toSync = leads.filter(
        (l) => l.syncStatus === "pending" || l.syncStatus === "failed"
      );

      if (toSync.length === 0) {
        setSyncState("online");
        return;
      }

      let anyFailed = false;

      for (const lead of toSync) {
        // Exponential backoff for previously-failed leads
        if (lead.retryCount > 0) {
          const delay = Math.min(1000 * 2 ** lead.retryCount, 30000);
          await new Promise((r) => setTimeout(r, delay));
        }

        // Double-check we're still online before each attempt
        if (!navigator.onLine) {
          setSyncState("offline");
          return;
        }

        await updateLead(lead.id, { syncStatus: "syncing" });
        try {
          const success = await submitToHubSpot(lead.formData as LeadFormData);
          if (success) {
            // Mark as synced first (keep the data), then remove
            await updateLead(lead.id, { syncStatus: "synced" });
            await removeLead(lead.id);
          } else {
            const newCount = lead.retryCount + 1;
            await updateLead(lead.id, {
              syncStatus: newCount >= MAX_RETRIES ? "failed" : "pending",
              retryCount: newCount,
            });
            anyFailed = true;
          }
        } catch {
          // Network error during POST — reset to pending, don't burn a retry
          // since the request likely never reached HubSpot
          await updateLead(lead.id, {
            syncStatus: "pending",
            retryCount: lead.retryCount,
          });
          anyFailed = true;
        }
      }

      if (anyFailed) {
        setSyncState("failed");
      }
    } finally {
      syncingRef.current = false;
      await refreshCounts();
      const remaining = await getPendingCount();
      if (remaining === 0) {
        setSyncState("online");
      }
    }
  }, [refreshCounts]);

  const submitLead = useCallback(
    async (formData: LeadFormData): Promise<boolean> => {
      // ALWAYS queue first — this is the bulletproof guarantee.
      // The lead is persisted in IndexedDB + localStorage before
      // we ever attempt to send it to HubSpot.
      const lead = await addLead(formData);
      await refreshCounts();

      // Now try immediate submission if online
      if (navigator.onLine) {
        try {
          const success = await submitToHubSpot(formData);
          if (success) {
            await removeLead(lead.id);
            await refreshCounts();
            return true;
          }
        } catch {
          // Network error — lead is already safely queued
        }
      }

      setSyncState("offline");
      return true; // Still "success" from user's perspective — it's queued
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
    const onFocus = () => {
      if (navigator.onLine) flushQueue();
    };
    // Also try to sync when page becomes visible (iPad waking from sleep)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        flushQueue();
      }
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // On startup: recover any leads stuck in "syncing" state from a crash
    recoverStuckLeads().then(() => {
      refreshCounts();
      if (navigator.onLine) flushQueue();
    });

    // Periodic sync — every 30 seconds
    const interval = setInterval(() => {
      if (!syncingRef.current && navigator.onLine) flushQueue();
    }, SYNC_INTERVAL_MS);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
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
