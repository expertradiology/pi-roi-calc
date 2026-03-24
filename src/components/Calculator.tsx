import { useState } from "react";
import {
  PRIMARY,
  PRIMARY_DARK,
  PRIMARY_LIGHT,
  ACCENT,
  SUCCESS,
  SUCCESS_LIGHT,
  COLORS,
  SLIDER_CONFIGS,
  BENCHMARKS,
  formatCurrency,
  formatNumber,
} from "../lib/constants";
import type { CalculatorResults } from "../hooks/useCalculator";
import type { LeadFormData } from "../lib/hubspot";
import Slider from "./Slider";
import MetricCard from "./MetricCard";
import BarChart from "./BarChart";
import BenchmarkItem from "./BenchmarkItem";
import InlineCtaForm from "./InlineCtaForm";

interface CalculatorProps {
  values: Record<string, number>;
  setValue: (key: string, value: number) => void;
  results: CalculatorResults;
  onRequestForm: () => void;
  onFormSubmit: (data: LeadFormData) => Promise<void>;
  syncIndicator?: React.ReactNode;
}

export default function Calculator({ values, setValue, results, onRequestForm, onFormSubmit, syncIndicator }: CalculatorProps) {
  const [benchmarksOpen, setBenchmarksOpen] = useState(false);

  const funnelItems = [
    { label: "Total Cases", val: results.annualCases, color: "#94a3b8" },
    { label: "Cases with Imaging", val: Math.round(results.casesWithImaging), color: "#6b7280" },
    { label: "Findings Underreported in Standard Reads", val: Math.round(results.casesUnderreported), color: PRIMARY_DARK },
    { label: "Made Actionable via Illustrated Reports", val: Math.round(results.casesMadeActionable), color: PRIMARY_LIGHT },
  ];

  const perCaseItems = [
    { l: "Avg. Settlement", v: formatCurrency(values.avgSettlement), accent: false },
    { l: "Uplift Per Improved Case", v: "+" + formatCurrency(results.additionalPerCase), accent: false },
    { l: "Cost Per Report", v: formatCurrency(values.costPerReport), accent: false },
    { l: "Net Value Per Imaging Case", v: formatCurrency(results.perCaseValue), accent: true },
  ];

  const returnMultiple =
    results.perCaseValue + values.costPerReport > 0
      ? ((results.perCaseValue + values.costPerReport) / values.costPerReport).toFixed(1)
      : "0";

  return (
    <div className="font-sans" style={{ color: COLORS.text1 }}>
      <div>
        {/* ===== TOP METRICS ===== */}
        <div className="flex md:flex-row flex-col gap-4 flex-wrap mb-8">
          <MetricCard
            large
            highlight
            label="Net Annual Gain"
            value={formatCurrency(results.netGain)}
            sub={
              formatCurrency(results.totalAdditionalRevenue) +
              " in added settlements minus " +
              formatCurrency(results.annualCost) +
              " in report costs"
            }
          />
          <MetricCard
            large
            highlight
            label="Return on Investment"
            value={results.roi.toFixed(0) + "%"}
            sub={"Every $1 spent on illustrated reports returns $" + (results.roi / 100 + 1).toFixed(2)}
          />
          <MetricCard
            large
            label="Value Per Imaging Case"
            value={formatCurrency(results.perCaseValue)}
            sub={
              "Net gain spread across " + formatNumber(Math.round(results.casesWithImaging)) + " annual imaging cases"
            }
          />
        </div>

        {/* ===== CALCULATOR CARD ===== */}
        <div
          className="rounded-2xl mb-10"
          style={{
            background: "#ffffff",
            boxShadow: "0 4px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            border: "1px solid #e8ecf2",
            padding: "32px",
          }}
        >
          <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            {/* ===== LEFT: SLIDERS ===== */}
            <div>
              <h2
                className="font-sans font-bold text-[20px] m-0 mb-6 pb-3"
                style={{ color: COLORS.heading, borderBottom: `1px solid ${COLORS.border}` }}
              >
                Your Firm's Assumptions
              </h2>
              {SLIDER_CONFIGS.map((cfg) => (
                <Slider
                  key={cfg.key}
                  label={cfg.label}
                  value={values[cfg.key]}
                  onChange={(v) => setValue(cfg.key, v)}
                  min={cfg.min}
                  max={cfg.max}
                  step={cfg.step}
                  format={cfg.format}
                  description={cfg.description}
                  benchmark={cfg.benchmark}
                />
              ))}
            </div>

            {/* ===== RIGHT: BREAKDOWN ===== */}
            <div>
              <h2
                className="font-sans font-bold text-[20px] m-0 mb-6 pb-3"
                style={{ color: COLORS.heading, borderBottom: `1px solid ${COLORS.border}` }}
              >
                Financial Breakdown
              </h2>

              {/* Case Funnel */}
              <div className="rounded-xl p-5 mb-6" style={{ background: COLORS.cardBg, border: "1px solid #f0f2f5" }}>
                <p className="text-[11px] font-sans font-semibold uppercase tracking-wider m-0 mb-4" style={{ color: COLORS.text3 }}>
                  Case Funnel — Annual
                </p>
                {funnelItems.map((item, i) => {
                  const pct = Math.max((item.val / results.annualCases) * 100, 4);
                  return (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[12px] font-sans" style={{ color: COLORS.text2 }}>
                          {item.label}
                        </span>
                        <span className="text-[13px] font-sans font-semibold" style={{ color: COLORS.text1 }}>
                          {formatNumber(item.val)}
                        </span>
                      </div>
                      <div className="h-[6px] rounded-[3px] overflow-hidden" style={{ background: "#e2e8f0" }}>
                        <div
                          className="h-full rounded-[3px] transition-[width] duration-300"
                          style={{ width: pct + "%", background: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Revenue Impact */}
              <div className="rounded-xl p-5 mb-6" style={{ background: COLORS.cardBg, border: "1px solid #f0f2f5" }}>
                <p className="text-[11px] font-sans font-semibold uppercase tracking-wider m-0 mb-4" style={{ color: COLORS.text3 }}>
                  Revenue Impact
                </p>
                <BarChart
                  label="Additional Settlements Recovered"
                  value={results.totalAdditionalRevenue}
                  maxVal={results.totalAdditionalRevenue * 1.2}
                  color={`linear-gradient(90deg, ${PRIMARY_DARK}, ${PRIMARY_LIGHT})`}
                />
                <BarChart
                  label="Annual Illustrated Report Cost"
                  value={results.annualCost}
                  maxVal={results.totalAdditionalRevenue * 1.2}
                  color={ACCENT}
                />
                <BarChart
                  label="Net Gain"
                  value={Math.max(results.netGain, 0)}
                  maxVal={results.totalAdditionalRevenue * 1.2}
                  color={`linear-gradient(90deg, ${SUCCESS}, ${SUCCESS_LIGHT})`}
                />
              </div>

              {/* Per-Case Economics */}
              <div className="rounded-xl p-5" style={{ background: COLORS.cardBg, border: "1px solid #f0f2f5" }}>
                <p className="text-[11px] font-sans font-semibold uppercase tracking-wider m-0 mb-4" style={{ color: COLORS.text3 }}>
                  Per-Case Economics
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {perCaseItems.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg"
                      style={{ padding: "10px 12px", background: "#f1f5f9" }}
                    >
                      <p className="text-[11px] font-sans uppercase tracking-wide m-0 mb-1" style={{ color: COLORS.text3 }}>
                        {item.l}
                      </p>
                      <p
                        className="text-[18px] font-sans font-bold m-0"
                        style={{ color: item.accent ? SUCCESS : COLORS.text1 }}
                      >
                        {item.v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Return Multiplier */}
              <div
                className="mt-6 rounded-xl text-center"
                style={{
                  background: "linear-gradient(135deg, #eef4ff, #dbeafe)",
                  border: "1px solid rgba(17,106,204,0.15)",
                  padding: "20px 24px",
                }}
              >
                <p className="text-[13px] font-sans m-0 mb-1.5" style={{ color: COLORS.text2 }}>
                  For every{" "}
                  <strong className="font-bold" style={{ color: COLORS.accentText }}>
                    {formatCurrency(values.costPerReport)}
                  </strong>{" "}
                  invested per illustrated report, your firm recovers an average of
                </p>
                <p className="text-[36px] font-sans font-bold my-1" style={{ color: COLORS.accentText }}>
                  {formatCurrency(results.perCaseValue + values.costPerReport)}
                </p>
                <p className="text-[12px] font-sans m-0 mb-4" style={{ color: COLORS.text3 }}>
                  in additional case value — a {returnMultiple}x return
                </p>
                <button
                  onClick={onRequestForm}
                  className="font-sans font-bold text-[13px] border-none rounded-md cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY_LIGHT})`,
                    color: "#fff",
                    padding: "10px 24px",
                  }}
                >
                  Send Me My Results &#8594;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== COLLAPSIBLE RESEARCH BENCHMARKS ===== */}
        <div
          className="mt-10 rounded-2xl"
          style={{
            background: "#ffffff",
            boxShadow: "0 4px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            border: "1px solid #e8ecf2",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setBenchmarksOpen(!benchmarksOpen)}
            aria-expanded={benchmarksOpen}
            aria-controls="benchmarks-content"
            className="w-full flex items-center justify-between p-6 cursor-pointer bg-transparent border-none text-left transition-colors duration-200 hover:bg-gray-50"
            style={{ outline: "none" }}
          >
            <div>
              <h2 className="font-sans font-bold text-[18px] m-0" style={{ color: COLORS.heading }}>
                Research &amp; Benchmarks
              </h2>
              <p className="font-sans text-[13px] m-0 mt-1" style={{ color: COLORS.text2 }}>
                Backed by 8 peer-reviewed studies — AJR, RSNA, PMC, JACR
              </p>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{
                color: PRIMARY,
                transform: benchmarksOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
                flexShrink: 0,
                marginLeft: 16,
              }}
            >
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div
            id="benchmarks-content"
            style={{
              display: "grid",
              gridTemplateRows: benchmarksOpen ? "1fr" : "0fr",
              transition: "grid-template-rows 0.3s ease",
            }}
          >
            <div style={{ overflow: "hidden" }}>
              <div style={{ padding: "0 24px 24px", borderTop: benchmarksOpen ? "1px solid #e8ecf2" : "none" }}>
                <div className="text-center mb-8 mt-6">
                  <p
                    className="text-[11px] font-sans font-semibold uppercase m-0 mb-2.5"
                    style={{ letterSpacing: "0.15em", color: PRIMARY }}
                  >
                    Research-Backed
                  </p>
                  <h3 className="font-sans font-bold text-[24px] m-0 mb-2" style={{ color: COLORS.heading }}>
                    Why Report Clarity Matters
                  </h3>
                  <p className="text-[14px] font-sans leading-relaxed mx-auto m-0" style={{ color: COLORS.text2, maxWidth: 620 }}>
                    Imaging findings are only as valuable as their presentation. Peer-reviewed data shows that how findings are
                    communicated impacts case outcomes as much as the findings themselves.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BENCHMARKS.map((b, i) => (
                    <BenchmarkItem key={i} stat={b.stat} detail={b.detail} source={b.source} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== INLINE CTA FORM ===== */}
        <InlineCtaForm results={results} onSubmit={onFormSubmit} />

        {/* ===== DISCLAIMER ===== */}
        <div className="mt-12 rounded-2xl" style={{ padding: 24, background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
          <p className="text-[11px] font-sans font-semibold uppercase tracking-wider m-0 mb-3" style={{ color: COLORS.text3 }}>
            Important Disclaimer
          </p>
          <p className="text-[11px] font-sans leading-relaxed m-0 mb-2.5" style={{ color: COLORS.text4 }}>
            <strong style={{ color: COLORS.text3 }}>For Informational &amp; Illustrative Purposes Only.</strong> This ROI
            calculator is provided as an educational business-planning tool and does not constitute legal, financial,
            medical, or professional advice of any kind. The projections generated are hypothetical estimates based on
            user-supplied assumptions and published research benchmarks — they are not guarantees, promises, or
            predictions of actual financial outcomes.
          </p>
          <p className="text-[11px] font-sans leading-relaxed m-0 mb-2.5" style={{ color: COLORS.text4 }}>
            <strong style={{ color: COLORS.text3 }}>Report Design, Not Medical Advice.</strong> Our service provides enhanced
            visual communication of imaging findings through custom anatomical illustrations and plain-language report
            design. We do not override, contradict, or replace prior medical diagnoses or radiology interpretations.
          </p>
          <p className="text-[11px] font-sans leading-relaxed m-0 mb-2.5" style={{ color: COLORS.text4 }}>
            <strong style={{ color: COLORS.text3 }}>No Guarantee of Results.</strong> Actual case outcomes, settlement values,
            and the impact of illustrated reports vary significantly based on jurisdiction, case facts, injury severity,
            insurance coverage, opposing counsel, judicial discretion, and many other factors beyond the scope of this model.
          </p>
          <p className="text-[11px] font-sans leading-relaxed m-0 mb-2.5" style={{ color: COLORS.text4 }}>
            <strong style={{ color: COLORS.text3 }}>Research Citations.</strong> Benchmark data cited in this tool is derived
            from peer-reviewed publications including AJR, PMC, Insights into Imaging, JACR, RSNA, and legal industry data.
          </p>
          <p className="text-[11px] font-sans leading-relaxed m-0" style={{ color: COLORS.text4 }}>
            <strong style={{ color: COLORS.text3 }}>Limitation of Liability.</strong> The creators and providers of this tool
            expressly disclaim any and all liability for decisions made, actions taken, or outcomes that result from the
            use of this calculator.
          </p>
        </div>

        {/* Methodology */}
        <div className="mt-6" style={{ padding: "16px 24px", borderTop: `1px solid ${COLORS.border}` }}>
          <p className="text-[11px] font-sans leading-relaxed" style={{ color: COLORS.text4, maxWidth: 720 }}>
            <strong style={{ color: COLORS.text3 }}>Methodology:</strong> This model estimates the incremental value of
            professionally illustrated, litigation-ready radiology reports over standard hospital/teleradiology reports.
            Adjust all assumptions to match your firm's experience.
          </p>
        </div>

        {/* Sync Indicator slot */}
        {syncIndicator}

        {/* Spacer for sticky bottom bar */}
        <div className="pb-32 md:pb-24" />
      </div>

      {/* ===== STICKY BOTTOM BAR ===== */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-4 flex-wrap"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(17,106,204,0.1)",
          padding: "12px 24px",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="text-[12px] font-sans" style={{ color: COLORS.text2 }}>
            Your firm could be leaving{" "}
            <strong className="font-bold text-[16px]" style={{ color: COLORS.accentText }}>
              {formatCurrency(results.netGain)}
            </strong>{" "}
            on the table annually
          </span>
          <span className="text-[11px]" style={{ color: COLORS.text4 }}>|</span>
          <span className="text-[12px] font-sans" style={{ color: COLORS.text3 }}>
            {results.roi.toFixed(0)}% ROI on illustrated reports
          </span>
        </div>
        <button
          onClick={onRequestForm}
          className="font-sans font-bold text-[13px] tracking-wide whitespace-nowrap border-none rounded-md cursor-pointer"
          style={{
            background: `linear-gradient(135deg, #cc1522, ${ACCENT}, #ff4d5a)`,
            backgroundSize: "200% 100%",
            animation: "roi-shimmer 3s ease infinite, roi-pulse-red 2s ease-in-out infinite",
            color: "#fff",
            padding: "8px 20px",
          }}
        >
          Send Me My Results &#8594;
        </button>
      </div>
    </div>
  );
}
