import { useRef, useCallback } from "react";
import type { SyncState } from "../hooks/useOfflineQueue";

interface SyncIndicatorProps {
  pendingCount: number;
  failedCount: number;
  syncState: SyncState;
  storageWarning: boolean;
  onRetry: () => void;
  onExport: () => void;
}

export default function SyncIndicator({
  pendingCount,
  failedCount,
  syncState,
  storageWarning,
  onRetry,
  onExport,
}: SyncIndicatorProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      onExport();
    }, 500);
  }, [onExport]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const dotColor =
    syncState === "online" ? "#76ca66" :
    syncState === "offline" ? "#f59e0b" :
    syncState === "syncing" ? "#116acc" :
    "#ef4444";

  const dotAnimation = syncState === "syncing" ? "sync-pulse 1.5s ease-in-out infinite" : "none";

  let statusText = "";
  if (syncState === "online" && pendingCount === 0 && failedCount === 0) {
    statusText = "Online — 0 pending";
  } else if (syncState === "offline") {
    statusText = `Offline — ${pendingCount} leads queued`;
  } else if (syncState === "syncing") {
    statusText = `Syncing... ${pendingCount} remaining`;
  } else if (failedCount > 0) {
    statusText = `${failedCount} failed — tap to retry`;
  } else if (pendingCount > 0) {
    statusText = `${pendingCount} pending`;
  } else {
    statusText = "Online — 0 pending";
  }

  return (
    <div
      className="flex items-center justify-center gap-2 py-2 select-none"
      style={{ padding: "8px" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={failedCount > 0 ? onRetry : undefined}
    >
      <div
        className="rounded-full"
        style={{
          width: 8,
          height: 8,
          background: dotColor,
          animation: dotAnimation,
          flexShrink: 0,
        }}
      />
      <span
        className="font-sans"
        style={{
          fontSize: 11,
          color: "#9ca3af",
          cursor: failedCount > 0 ? "pointer" : "default",
        }}
      >
        {statusText}
      </span>
      {storageWarning && (
        <span className="font-sans" style={{ fontSize: 11, color: "#ef4444" }}>
          Warning: Queue data may have been lost (iOS storage)
        </span>
      )}
    </div>
  );
}
