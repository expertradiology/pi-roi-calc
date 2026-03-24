import { useState } from "react";
import {
  PRIMARY,
  PRIMARY_DARK,
  PRIMARY_LIGHT,
  SUCCESS,
  COLORS,
  COMPANY_TYPES,
  US_STATES,
  formatCurrency,
} from "../lib/constants";
import type { LeadFormData } from "../lib/hubspot";
import type { CalculatorResults } from "../hooks/useCalculator";

interface InlineCtaFormProps {
  results: CalculatorResults;
  onSubmit: (data: LeadFormData) => Promise<void>;
}

export default function InlineCtaForm({ results, onSubmit }: InlineCtaFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [state, setState] = useState("");

  const validate = () => {
    const errs: Record<string, boolean> = {};
    if (!firstname.trim()) errs.firstname = true;
    if (!lastname.trim()) errs.lastname = true;
    if (!email.trim() || !email.includes("@")) errs.email = true;
    if (!phone.trim()) errs.phone = true;
    if (!company.trim()) errs.company = true;
    if (!companyType) errs.companyType = true;
    if (!state) errs.state = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || submitting) return;
    setSubmitting(true);
    await onSubmit({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim(),
      company_type: companyType,
      state,
    });
    setSubmitting(false);
  };

  const resetForm = () => {
    setFirstname("");
    setLastname("");
    setEmail("");
    setPhone("");
    setCompany("");
    setCompanyType("");
    setState("");
    setShowForm(false);
    setErrors({});
  };

  const inputStyle = (hasError: boolean) => ({
    background: COLORS.inputBg,
    border: `1px solid ${hasError ? "#ef4444" : COLORS.borderInput}`,
    padding: "10px 14px",
    color: COLORS.text1,
  });

  return (
    <div id="cta-section" className="mt-10">
      <div
        className="relative overflow-hidden rounded-2xl text-center"
        style={{
          background: "linear-gradient(135deg, #eef4ff 0%, #dbeafe 50%, #eef4ff 100%)",
          border: "1px solid rgba(17,106,204,0.12)",
          padding: "48px",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, transparent, ${PRIMARY_LIGHT}, transparent)` }}
        />

        {/* ── CTA State ── */}
        {!showForm && (
          <div>
            <p
              className="text-[11px] font-sans font-semibold uppercase m-0 mb-3"
              style={{ letterSpacing: "0.15em", color: PRIMARY }}
            >
              See the Difference Firsthand
            </p>
            <h2
              className="font-sans font-bold m-0 mb-3 leading-tight"
              style={{ fontSize: "clamp(24px, 3vw, 34px)", color: COLORS.heading }}
            >
              See What Your Cases Look Like
              <br />
              <span style={{ color: COLORS.accentText }}>with Illustrated Reports</span>
            </h2>
            <p
              className="text-[14px] font-sans leading-relaxed mx-auto mb-7"
              style={{ color: COLORS.text2, maxWidth: 540 }}
            >
              We will redesign a sample report from one of your cases — with custom anatomical illustrations and
              plain-language findings — so you can see the difference firsthand. No cost, no obligation.
            </p>

            {/* ROI callout */}
            <div
              className="rounded-xl inline-block mb-6"
              style={{
                padding: "14px 24px",
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(17,106,204,0.1)",
              }}
            >
              <p className="text-[12px] font-sans m-0 mb-0.5" style={{ color: COLORS.text3 }}>
                Your projected annual gain:
              </p>
              <p className="text-[24px] font-sans font-bold m-0" style={{ color: COLORS.accentText }}>
                {formatCurrency(results.netGain)} at {results.roi.toFixed(0)}% ROI
              </p>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => setShowForm(true)}
                className="font-sans font-bold text-[15px] border-none rounded-lg cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY_LIGHT})`,
                  color: "#fff",
                  padding: "14px 32px",
                }}
              >
                Request Your Free Sample Report
              </button>
            </div>
            <div className="flex gap-6 justify-center mt-6 flex-wrap">
              {[
                "No cost or obligation",
                "Illustrated report from your actual case",
                "Custom ROI projection for your firm",
              ].map((txt, i) => (
                <span key={i} className="text-[12px] font-sans flex items-center gap-1.5" style={{ color: COLORS.text3 }}>
                  <span className="text-[14px]" style={{ color: SUCCESS }}>
                    &#10003;
                  </span>{" "}
                  {txt}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Form State ── */}
        {showForm && (
          <div className="max-w-[480px] mx-auto text-left">
            <h3 className="font-sans font-bold text-[24px] m-0 mb-1.5 text-center" style={{ color: COLORS.heading }}>
              Tell Us About Your Firm
            </h3>
            <p className="text-[13px] font-sans m-0 mb-6 text-center" style={{ color: COLORS.text3 }}>
              We'll reach out within one business day with your sample report.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <input
                className="roi-input font-sans text-[14px] w-full rounded-lg"
                style={inputStyle(!!errors.firstname)}
                placeholder="First Name *"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
              <input
                className="roi-input font-sans text-[14px] w-full rounded-lg"
                style={inputStyle(!!errors.lastname)}
                placeholder="Last Name *"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>
            <input
              className="roi-input font-sans text-[14px] w-full rounded-lg mt-3"
              style={inputStyle(!!errors.email)}
              placeholder="Email Address *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="roi-input font-sans text-[14px] w-full rounded-lg mt-3"
              style={inputStyle(!!errors.phone)}
              placeholder="Phone Number *"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="roi-input font-sans text-[14px] w-full rounded-lg mt-3"
              style={inputStyle(!!errors.company)}
              placeholder="Company Name *"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <select
                className="roi-input font-sans text-[14px] w-full rounded-lg cursor-pointer"
                style={inputStyle(!!errors.companyType)}
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
              >
                <option value="">Company Type *</option>
                {COMPANY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                className="roi-input font-sans text-[14px] w-full rounded-lg cursor-pointer"
                style={inputStyle(!!errors.state)}
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">State *</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 font-sans font-bold text-[15px] border-none rounded-lg cursor-pointer"
                style={{
                  background: submitting
                    ? "#94a3b8"
                    : `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY_LIGHT})`,
                  color: "#fff",
                  padding: "14px",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Sending..." : "Submit Request"}
              </button>
              <button
                onClick={resetForm}
                className="font-sans text-[14px] rounded-lg cursor-pointer"
                style={{
                  background: "transparent",
                  color: COLORS.text2,
                  border: `1px solid ${COLORS.borderInput}`,
                  padding: "14px 20px",
                }}
              >
                Back
              </button>
            </div>
            <p className="text-[11px] font-sans text-center mt-3 mb-0 leading-relaxed" style={{ color: COLORS.text4 }}>
              By submitting, you agree to be contacted regarding our illustrated radiology report services. We respect
              your privacy and will never share your information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
