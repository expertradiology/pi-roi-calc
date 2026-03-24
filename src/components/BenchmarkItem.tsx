import { PRIMARY } from "../lib/constants";

export default function BenchmarkItem({
  stat,
  source,
  detail,
}: {
  stat: string;
  source: string;
  detail: string;
}) {
  return (
    <div
      className="rounded-lg p-3.5"
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderLeftWidth: 3,
        borderLeftColor: PRIMARY,
        borderLeftStyle: "solid",
      }}
    >
      <p className="text-[18px] font-sans font-bold m-0 mb-1" style={{ color: PRIMARY }}>
        {stat}
      </p>
      <p className="text-[12px] font-sans leading-snug m-0 mb-0.5" style={{ color: "#4b5563" }}>
        {detail}
      </p>
      <p className="text-[10px] font-sans italic m-0" style={{ color: "#9ca3af" }}>
        {source}
      </p>
    </div>
  );
}
