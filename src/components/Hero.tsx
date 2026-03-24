export default function Hero() {
  return (
    <div className="pt-[88px] mb-10 px-4">
      <div
        className="relative rounded-2xl overflow-hidden mx-auto"
        style={{
          maxWidth: 1280,
          boxShadow: "0 4px 32px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {/* Blue gradient background */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #0a2a5e 0%, #116acc 50%, #1a7aee 100%)" }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(59,142,237,0.25) 0%, transparent 70%)" }}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0 items-end">
          {/* Left: Text content */}
          <div className="p-8 md:p-10 lg:p-12 lg:pb-10">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2.5"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Business Case Calculator
            </p>
            <h1
              className="font-bold leading-tight mb-3 text-white"
              style={{ fontSize: "clamp(26px, 3.5vw, 40px)" }}
            >
              The Value of Illustrated Radiology Reports{" "}
              <span style={{ color: "#93c5fd" }}>for Personal Injury Firms</span>
            </h1>
            <p
              className="text-[14px] leading-relaxed mt-3 mb-0 max-w-[520px]"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Standard radiology reports are written for doctors, not juries. See how illustrated, plain-language reports
              designed for litigation translate to recoverable value for your firm.
            </p>
            <button
              onClick={() => {
                document.getElementById("calculator-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-block font-semibold text-[13px] tracking-wide rounded-lg mt-6 border-none cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#ffffff",
                padding: "10px 24px",
              }}
            >
              Try Our ROI Calculator &darr;
            </button>
          </div>

          {/* Right: Report mockup image */}
          <div className="relative flex items-end justify-center" style={{ minHeight: 320, overflow: "visible" }}>
            <img
              src="/images/reports/v3-exrad-report-pages.png"
              alt="Expert Radiology illustrated report pages spread showing anatomical illustrations, MRI findings, and plain-language findings"
              className="block h-auto"
              style={{ width: "100%", maxWidth: "none", paddingTop: 16 }}
              loading="eager"
              width={964}
              height={662}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
