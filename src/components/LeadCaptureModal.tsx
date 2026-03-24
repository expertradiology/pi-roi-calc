import { useState, useEffect } from "react";
import {
  PRIMARY_DARK,
  PRIMARY_LIGHT,
  COLORS,
  COMPANY_TYPES,
  US_STATES,
  formatCurrency,
} from "../lib/constants";
import type { LeadFormData } from "../lib/hubspot";
import type { CalculatorResults } from "../hooks/useCalculator";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeadFormData) => Promise<void>;
  results: CalculatorResults;
}

export default function LeadCaptureModal({ isOpen, onClose, onSubmit, results }: LeadCaptureModalProps) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [state, setState] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [visible, setVisible] = useState(false);

  // Slide-up animation
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    // Reset form
    setFirstname("");
    setLastname("");
    setEmail("");
    setPhone("");
    setCompany("");
    setCompanyType("");
    setState("");
    setSubmitting(false);
  };

  const inputStyle = (hasError: boolean) => ({
    background: COLORS.inputBg,
    border: `1px solid ${hasError ? "#ef4444" : COLORS.borderInput}`,
    padding: "10px 14px",
    color: COLORS.text1,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[540px] rounded-t-2xl bg-white overflow-y-auto"
        style={{
          maxHeight: "90vh",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s ease-out",
          padding: "32px 28px 28px",
        }}
      >
        {/* ROI Preview */}
        <div
          className="rounded-xl text-center mb-6"
          style={{
            background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY_LIGHT})`,
            padding: "20px",
          }}
        >
          <p className="text-[11px] font-sans uppercase tracking-wider m-0 mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            Your Projected Annual Gain
          </p>
          <p className="text-[32px] font-sans font-bold m-0" style={{ color: "#fff" }}>
            {formatCurrency(results.netGain)}
          </p>
          <p className="text-[13px] font-sans m-0 mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
            {results.roi.toFixed(0)}% Return on Investment
          </p>
        </div>

        <h3 className="font-sans font-bold text-[22px] m-0 mb-1 text-center" style={{ color: COLORS.heading }}>
          Get Your ROI Report
        </h3>
        <p className="text-[13px] font-sans m-0 mb-5 text-center" style={{ color: COLORS.text3 }}>
          We'll email your custom projections
        </p>

        {/* Form fields */}
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

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full font-sans font-bold text-[15px] border-none rounded-lg cursor-pointer mt-5"
          style={{
            background: submitting
              ? "#94a3b8"
              : `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY_LIGHT})`,
            color: "#fff",
            padding: "14px",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Sending..." : "Send My Results \u2192"}
        </button>

        {/* Skip */}
        <button
          onClick={onClose}
          className="w-full font-sans text-[14px] bg-transparent border-none cursor-pointer mt-3"
          style={{ color: COLORS.text2, padding: "8px" }}
        >
          Skip — just keep exploring
        </button>

        {/* Privacy */}
        <p className="text-[11px] font-sans text-center mt-3 mb-0 leading-relaxed" style={{ color: COLORS.text4 }}>
          By submitting, you agree to be contacted regarding our illustrated radiology report services.
          We respect your privacy and will never share your information.
        </p>
      </div>
    </div>
  );
}
