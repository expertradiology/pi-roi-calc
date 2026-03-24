import { useState, useCallback } from "react";
import { useCalculator } from "./hooks/useCalculator";
import { useOfflineQueue } from "./hooks/useOfflineQueue";
import type { LeadFormData } from "./lib/hubspot";
import Header from "./components/Header";
import Hero from "./components/Hero";
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
    // Scroll back to top on reset
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [calculator]);

  return (
    <div style={{ background: "linear-gradient(180deg, #ffffff 0%, #f5f7ff 35%, #f5f7ff 65%, #ffffff 100%)", minHeight: "100vh" }}>
      {/* Fixed header with logo */}
      <Header />

      {/* Calculator is always rendered but hidden during thank you */}
      <div style={{ display: screen === "thankyou" ? "none" : "block" }}>
        {/* Hero section */}
        <Hero />

        {/* Calculator content */}
        <div id="calculator-card" className="max-w-[1120px] mx-auto px-6 pb-20 scroll-mt-[80px]">
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
