/* ── Brand tokens ── */
export const PRIMARY = "#116acc";
export const PRIMARY_LIGHT = "#3b8eed";
export const PRIMARY_DARK = "#0d4f99";
export const ACCENT = "#ff1b2e";
export const SUCCESS = "#76ca66";
export const SUCCESS_LIGHT = "#4ade80";

/* ── Theme colors (light only) ── */
export const COLORS = {
  pageBg: "#ffffff",
  cardBg: "#f8fafc",
  border: "#e2e8f0",
  borderInput: "#cbd5e1",
  text1: "#182233",
  text2: "#6b7280",
  text3: "#9ca3af",
  text4: "#b0b8c4",
  heading: "#182233",
  accentText: PRIMARY,
  inputBg: "#f1f5f9",
} as const;

/* ── Slider configurations ── */
export interface SliderConfig {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  format: (v: number) => string;
  description: string;
  benchmark?: string;
}

export const formatCurrency = (n: number): string => {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "K";
  return "$" + n.toFixed(0);
};

export const formatNumber = (n: number): string => n.toLocaleString("en-US");

export const SLIDER_CONFIGS: SliderConfig[] = [
  {
    key: "casesPerMonth",
    label: "Cases Per Month",
    min: 5, max: 200, step: 5, defaultValue: 40,
    format: (v) => String(v),
    description: "Total new PI cases your firm takes on monthly",
  },
  {
    key: "pctWithImaging",
    label: "Cases Involving Imaging",
    min: 20, max: 100, step: 5, defaultValue: 75,
    format: (v) => v + "%",
    description: "Percentage of cases that include diagnostic imaging",
  },
  {
    key: "avgSettlement",
    label: "Average Settlement Value",
    min: 10000, max: 500000, step: 5000, defaultValue: 85000,
    format: formatCurrency,
    description: "Mean settlement or verdict on your typical PI case",
    benchmark: "Benchmark: U.S. PI settlements typically range $20K\u2013$75K; median ~$31K (2025 data)",
  },
  {
    key: "underreportedRate",
    label: "Findings Underreported in Standard Reads",
    min: 5, max: 60, step: 5, defaultValue: 30,
    format: (v) => v + "%",
    description: "% of standard reports where findings are buried in jargon, lack illustration, or are inadequately communicated for legal use",
    benchmark: "Benchmark: ~30% of imaging findings are poorly communicated in standard reports (AJR, PMC peer-reviewed studies)",
  },
  {
    key: "clarityUplift",
    label: "Clarity Uplift from Illustrated Reports",
    min: 5, max: 75, step: 5, defaultValue: 25,
    format: (v) => v + "%",
    description: "% of underreported findings that become actionable when presented with custom illustrations and plain-language design",
    benchmark: "Benchmark: Subspecialist reporting resolves discrepancies 82% of the time; illustrated reports amplify this further",
  },
  {
    key: "settlementUplift",
    label: "Settlement Uplift with Clear Documentation",
    min: 5, max: 100, step: 5, defaultValue: 35,
    format: (v) => v + "%",
    description: "Avg % increase in case value when injuries are visually illustrated and clearly documented for adjusters, mediators, and juries",
    benchmark: "Benchmark: Cases with clear imaging documentation settle 30\u2013400% higher than those without visual proof",
  },
  {
    key: "costPerReport",
    label: "Cost Per Illustrated Report",
    min: 50, max: 1500, step: 25, defaultValue: 350,
    format: formatCurrency,
    description: "Your per-case cost for a professionally designed, illustrated radiology report",
  },
];

/* ── Dropdown options ── */
export const COMPANY_TYPES = [
  "Personal Injury Law Firm",
  "Mass Tort Firm",
  "General Practice (PI Focus)",
  "Insurance Defense",
  "Medical Malpractice",
  "Workers' Compensation",
  "Other",
];

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

/* ── HubSpot config ── */
export const HUBSPOT_PORTAL_ID = import.meta.env.VITE_HUBSPOT_PORTAL_ID || "REPLACE_ME";
export const HUBSPOT_FORM_ID = import.meta.env.VITE_HUBSPOT_FORM_ID || "REPLACE_ME";

/* ── Benchmark data ── */
export const BENCHMARKS = [
  {
    stat: "~30% of Findings Poorly Communicated",
    detail: "Among imaging studies with abnormalities, approximately 30% have findings that are underreported, buried in jargon, or inadequately communicated in standard reports written for other physicians.",
    source: "Berlin L., AJR; Lee et al., AJR 2013; Garland, 1959; Brady, Insights into Imaging, 2017",
  },
  {
    stat: "75% of Claims Involve Communication Gaps",
    detail: "The vast majority of radiology-related malpractice claims stem from communication failures \u2014 not the imaging itself, but how findings were reported and conveyed to treating physicians and legal teams.",
    source: "Lee et al., Cognitive and System Factors Contributing to Diagnostic Errors in Radiology, AJR",
  },
  {
    stat: "12\u201341% Discrepancy on Re-Review",
    detail: "When imaging is re-reviewed with focused attention, significant additional findings are identified and communicated in 12\u201341% of cases \u2014 findings that were present but not clearly conveyed in the original report.",
    source: "AJR 2012; Siewert et al.; Published systematic reviews of radiology second-opinion studies",
  },
  {
    stat: "82% Clarity Advantage from Specialists",
    detail: "When subspecialists provide more detailed, focused reporting, their interpretations prove more actionable 82% of the time. Custom illustrations and plain-language design amplify this advantage for legal audiences.",
    source: "Musculoskeletal imaging study, AJR 2020; 2mdopinion.com meta-analysis",
  },
  {
    stat: "30\u2013400% Higher Settlements with Visual Proof",
    detail: "Personal injury settlements backed by clear, well-documented imaging evidence typically settle 30\u2013400% higher. Illustrated reports make injuries visible and impossible for adjusters and juries to dismiss.",
    source: "Multiple PI legal sources; Wooldridge Law; GJEL Accident Attorneys; victimslawyer.com, 2025\u20132026",
  },
  {
    stat: "92% of Clarified Reports Changed Outcomes",
    detail: "When imaging findings were properly communicated through detailed second reads, the course of action changed for 92% of patients \u2014 proving that presentation, not just detection, drives decisions.",
    source: "Robinson et al., Journal of the American College of Radiology, 2022",
  },
  {
    stat: "$40K\u2013$75K Average PI Settlement",
    detail: "U.S. personal injury settlements typically range from $20K to $75K, with a median around $31K. The quality of medical documentation is the single biggest lever attorneys have to move these numbers.",
    source: "ConsumerShield, CASEpeer, Insurance Research Council, 2024\u20132025 data",
  },
  {
    stat: "95% of PI Cases Settle Pre-Trial",
    detail: "Nearly all PI cases resolve through negotiation, not trial. In settlement negotiations, clear visual evidence \u2014 not dense medical jargon \u2014 is what moves adjusters to offer fair value.",
    source: "The Law Dictionary; Clio Legal Trends Report, 2025",
  },
];
