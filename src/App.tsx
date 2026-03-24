import { useState, useCallback } from "react";
import { useCalculator } from "./hooks/useCalculator";
import { useOfflineQueue } from "./hooks/useOfflineQueue";
import type { LeadFormData } from "./lib/hubspot";
import Calculator from "./components/Calculator";
import LeadCaptureModal from "./components/LeadCaptureModal";
import ThankYouScreen from "./components/ThankYouScreen";
import SyncIndicator from "./components/SyncIndicator";

type Screen = "calculator" | "form" | "thankyou";

export default function App() {
  const [screen, setScreen] = useState<Screen>("calculator");
  const calculator = useCalculator();
  const queue = useOfflineQueue();

  const handleRequestForm = useCallback(() => {
    setScreen("form");
  }, []);

  const handleFormSubmit = useCallback(
    async (data: LeadFormData) => {
      await queue.submitLead(data);
      setScreen("thankyou");
    },
    [queue]
  );

  const handleFormClose = useCallback(() => {
    setScreen("calculator");
  }, []);

  const handleReset = useCallback(() => {
    calculator.reset();
    setScreen("calculator");
  }, [calculator]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
      {/* Calculator is always rendered but hidden during thank you */}
      <div style={{ display: screen === "thankyou" ? "none" : "block" }}>
        <Calculator
          values={calculator.values}
          setValue={calculator.setValue}
          results={calculator.results}
          onRequestForm={handleRequestForm}
          syncIndicator={
            <SyncIndicator
              pendingCount={queue.pendingCount}
              failedCount={queue.failedCount}
              syncState={queue.syncState}
              storageWarning={queue.storageWarning}
              onRetry={queue.retryFailed}
              onExport={queue.exportCsv}
            />
          }
        />
      </div>

      {/* Lead capture modal */}
      <LeadCaptureModal
        isOpen={screen === "form"}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        results={calculator.results}
      />

      {/* Thank you screen */}
      {screen === "thankyou" && (
        <ThankYouScreen
          results={calculator.results}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
