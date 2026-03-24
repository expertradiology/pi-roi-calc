import { formatCurrency } from "../lib/constants";

export default function BarChart({
  label,
  value,
  maxVal,
  color,
}: {
  label: string;
  value: number;
  maxVal: number;
  color: string;
}) {
  const pct = Math.min((value / maxVal) * 100, 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-[13px] font-sans" style={{ color: "#6b7280" }}>
          {label}
        </span>
        <span className="text-[13px] font-sans font-semibold" style={{ color: "#182233" }}>
          {formatCurrency(value)}
        </span>
      </div>
      <div className="h-2 rounded overflow-hidden" style={{ background: "#e2e8f0" }}>
        <div
          className="h-full rounded transition-[width] duration-300 ease-out"
          style={{ width: pct + "%", background: color }}
        />
      </div>
    </div>
  );
}
