/**
 * Gráfico SVG inline de série temporal (sem dependências).
 * Renderiza barras com axis simples — adequado pra dashboards densos.
 */

export interface ChartPoint {
  /** Label do eixo X (ex.: "12/05" ou "Mai") */
  label: string;
  /** Valor numérico */
  value: number;
  /** Data ISO completa pro tooltip nativo */
  iso?: string;
}

export function DailyBarChart({
  data,
  height = 200,
  color = "#ff6a00",
  emptyMsg = "Sem dados na janela",
}: {
  data: ChartPoint[];
  height?: number;
  color?: string;
  emptyMsg?: string;
}) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border text-sm opacity-50"
        style={{ height, borderColor: "var(--border)", borderStyle: "dashed" }}
      >
        {emptyMsg}
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const peak = data.reduce((acc, d) => (d.value > acc.value ? d : acc), data[0]);

  // Layout: cada barra ocupa 100/data.length % da largura, com gap pequeno
  const barWidth = 100 / data.length;
  const gap = Math.max(0.4, barWidth * 0.08);

  // Linhas de grade (eixo Y) — divide em 4 partes
  const gridLines = [0.25, 0.5, 0.75, 1].map((p) => ({
    y: 100 - p * 100,
    value: Math.round(maxValue * p),
  }));

  return (
    <div className="border rounded-xl p-4" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-wider opacity-60">Total na janela</div>
          <div className="text-3xl font-bold" style={{ color }}>
            {total.toLocaleString("pt-BR")}
          </div>
        </div>
        <div className="text-right text-[10px] opacity-60">
          Pico: <strong>{peak.value}</strong> em <strong>{peak.label}</strong>
        </div>
      </div>

      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 100 100`}
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          style={{ display: "block" }}
        >
          {/* Linhas de grade */}
          {gridLines.map((g, i) => (
            <line
              key={i}
              x1={0}
              x2={100}
              y1={g.y}
              y2={g.y}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeWidth={0.2}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Barras */}
          {data.map((d, i) => {
            const x = i * barWidth + gap / 2;
            const w = barWidth - gap;
            const h = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
            const y = 100 - h;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={color}
                  opacity={d.value === 0 ? 0.15 : 0.9}
                >
                  <title>{`${d.label}: ${d.value}`}</title>
                </rect>
              </g>
            );
          })}
        </svg>

        {/* Labels Y absolutos (sobreposto, fora do viewBox) */}
        <div className="absolute -left-2 top-0 bottom-0 w-8 pointer-events-none">
          {gridLines.map((g, i) => (
            <div
              key={i}
              className="absolute text-[9px] opacity-50 text-right pr-1"
              style={{ top: `${g.y}%`, right: "100%", transform: "translateY(-50%)" }}
            >
              {g.value}
            </div>
          ))}
        </div>
      </div>

      {/* Labels X */}
      <div className="mt-2 grid text-[9px] opacity-60" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
        {data.map((d, i) => {
          // Em janelas longas, mostra label só a cada N barras
          const step = data.length <= 14 ? 1 : data.length <= 31 ? 3 : data.length <= 60 ? 7 : 4;
          const show = i === 0 || i === data.length - 1 || i % step === 0;
          return (
            <div key={i} className="truncate text-center" style={{ opacity: show ? 1 : 0 }}>
              {d.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
