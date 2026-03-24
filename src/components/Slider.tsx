import { PRIMARY_DARK, PRIMARY_LIGHT } from "../lib/constants";

export default function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  description,
  benchmark,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  description?: string;
  benchmark?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="flex justify-between items-baseline mb-1">
        <span
          className="text-[13px] font-sans font-medium tracking-wide uppercase"
          style={{ color: "#6b7280" }}
        >
          {label}
        </span>
        <span className="text-[22px] font-sans font-bold" style={{ color: "#182233" }}>
          {format ? format(value) : value}
        </span>
      </div>
      {description && (
        <p className="text-[12px] font-sans leading-snug m-0 mb-1" style={{ color: "#9ca3af" }}>
          {description}
        </p>
      )}
      {benchmark && (
        <p className="text-[11px] font-sans leading-snug italic m-0 mb-2" style={{ color: "#94a3b8" }}>
          {benchmark}
        </p>
      )}
      <div className="relative h-5 flex items-center">
        <div
          className="absolute left-0 right-0 h-[6px] rounded-[3px]"
          style={{ background: "#e2e8f0" }}
        >
          <div
            className="h-full rounded-[3px] transition-[width] duration-100 ease-out"
            style={{ width: pct + "%", background: `linear-gradient(90deg, ${PRIMARY_DARK}, ${PRIMARY_LIGHT})` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute left-0 w-full bg-transparent cursor-pointer h-5 roi-slider"
          style={{ WebkitAppearance: "none", appearance: "none", margin: 0 }}
        />
      </div>
    </div>
  );
}
