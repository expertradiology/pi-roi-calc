import { useState, useEffect, useCallback } from "react";
import { PRIMARY, SUCCESS, formatCurrency } from "../lib/constants";
import type { CalculatorResults } from "../hooks/useCalculator";

interface ThankYouScreenProps {
  results: CalculatorResults;
  onReset: () => void;
}

const COUNTDOWN_SECONDS = 5;

export default function ThankYouScreen({ results, onReset }: ThankYouScreenProps) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [paused, setPaused] = useState(false);

  const togglePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  useEffect(() => {
    if (paused) return;
    if (secondsLeft <= 0) {
      onReset();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, paused, onReset]);

  const progress = ((COUNTDOWN_SECONDS - secondsLeft) / COUNTDOWN_SECONDS) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #eef4ff 0%, #dbeafe 50%, #f0f9ff 100%)",
      }}
      onClick={togglePause}
    >
      <div className="text-center px-8 max-w-[480px]">
        {/* Checkmark */}
        <div
          className="mx-auto mb-4 flex items-center justify-center rounded-full"
          style={{
            width: 72,
            height: 72,
            background: "rgba(118, 202, 102, 0.15)",
          }}
        >
          <span style={{ fontSize: 40, color: SUCCESS, lineHeight: 1 }}>&#10003;</span>
        </div>

        {/* Heading */}
        <h2
          className="font-sans font-bold text-[32px] m-0 mb-2"
          style={{ color: PRIMARY }}
        >
          Thank You!
        </h2>
        <p
          className="text-[15px] font-sans leading-relaxed m-0 mb-6"
          style={{ color: "#6b7280" }}
        >
          We'll send your personalized ROI report to your email.
        </p>

        {/* Results box */}
        <div
          className="rounded-xl mx-auto mb-8 inline-block"
          style={{
            padding: "16px 28px",
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(17,106,204,0.12)",
          }}
        >
          <p className="text-[12px] font-sans m-0 mb-1" style={{ color: "#9ca3af" }}>
            Your calculated potential:
          </p>
          <p className="text-[24px] font-sans font-bold m-0" style={{ color: PRIMARY }}>
            {formatCurrency(results.netGain)} annual net gain at {results.roi.toFixed(0)}% ROI
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="mx-auto rounded-full overflow-hidden mb-3"
          style={{ width: 200, height: 6, background: "rgba(17,106,204,0.1)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: progress + "%",
              background: `linear-gradient(90deg, ${PRIMARY}, #3b8eed)`,
              transition: "width 1s linear",
            }}
          />
        </div>

        {/* Countdown text */}
        <p className="text-[13px] font-sans m-0" style={{ color: "#9ca3af" }}>
          {paused ? "Tap to resume" : `Resetting in ${secondsLeft} seconds...`}
        </p>
      </div>
    </div>
  );
}
