import { PRIMARY } from "../lib/constants";

export default function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  large?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl flex-1"
      style={{
        background: "#ffffff",
        border: "1px solid #e8ecf2",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)",
        padding: "28px",
        minWidth: 200,
      }}
    >
      <p
        className="text-[11px] font-sans font-semibold uppercase tracking-widest m-0 mb-3"
        style={{ color: "#9ca3af" }}
      >
        {label}
      </p>
      <p
        className="font-sans font-bold m-0 leading-none"
        style={{
          fontSize: 42,
          color: highlight ? PRIMARY : "#182233",
        }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[12px] font-sans mt-2 mb-0 leading-snug" style={{ color: "#6b7280" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
