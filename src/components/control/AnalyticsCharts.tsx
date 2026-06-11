// CSS-based analytics charts — no external chart library needed
// All charts are pure div/CSS bars and line indicators

export function BarChart({
  data,
  height = 160,
  color = "bg-talentia-blue",
  emptyLabel = "Sin datos",
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  emptyLabel?: string;
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-gray-400 font-medium">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => {
        const pct = Math.max((d.value / maxVal) * 100, 2);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip on hover */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
              {d.value}
            </div>
            <div
              className={`w-full rounded-t ${color} transition-all duration-300`}
              style={{ height: `${pct}%`, minHeight: "4px" }}
            />
            {d.label && (
              <span className="text-[8px] text-gray-400 font-semibold -rotate-45 origin-left whitespace-nowrap mt-1">
                {d.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SimpleLine({
  data,
  height = 80,
  color = "text-talentia-blue",
  emptyLabel = "Sin datos",
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  emptyLabel?: string;
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-gray-400 font-medium">{emptyLabel}</p>
      </div>
    );
  }

  // Generate SVG polyline
  const w = 100;
  const h = 100;
  const step = w / (data.length - 1);
  const points = data.map((d, i) => {
    const x = i * step;
    const y = h - (d.value / maxVal) * h;
    return `${x},${y}`;
  });
  const polyline = points.join(" ");

  return (
    <div style={{ height }} className="flex items-center justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible">
        {/* Grid lines */}
        <line x1="0" y1="0" x2={w} y2="0" stroke="#f1f5f9" strokeWidth="0.5" />
        <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="#f1f5f9" strokeWidth="0.5" />
        <line x1="0" y1={h} x2={w} y2={h} stroke="#f1f5f9" strokeWidth="0.5" />
        {/* Area fill */}
        <polygon
          points={`0,${h} ${polyline} ${w},${h}`}
          fill="currentColor"
          fillOpacity="0.08"
          className={color}
        />
        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={color}
        />
        {/* Dots */}
        {data.map((d, i) => {
          const x = i * step;
          const y = h - (d.value / maxVal) * h;
          return (
            <circle key={i} cx={x} cy={y} r="2" fill="currentColor" className={color}>
              <title>{d.label}: {d.value}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}

export function MiniStat({
  label,
  value,
  change,
  positive = true,
}: {
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-navy mt-0.5">{value}</p>
      {change && (
        <p className={`text-xs font-bold mt-0.5 ${positive ? "text-green-600" : "text-red-600"}`}>
          {positive ? "↑" : "↓"} {change}
        </p>
      )}
    </div>
  );
}

export function ActivityFeed({
  items,
  emptyLabel = "Sin actividad reciente",
}: {
  items: { time: string; text: string; type?: string }[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8 font-medium">{emptyLabel}</p>;
  }

  const typeColors: Record<string, string> = {
    view: "bg-blue-500",
    contact: "bg-green-500",
    favorite: "bg-purple-500",
    signup: "bg-orange-500",
    default: "bg-gray-400",
  };

  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColors[item.type || "default"]}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-navy font-semibold">{item.text}</p>
            <p className="text-[11px] text-gray-400 font-medium">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}