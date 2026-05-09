"use client";

/**
 * RadarChart genérico em SVG.
 *
 * Mostra:
 * - Área do perfil individual (preenchida, color)
 * - Linha de norma populacional (referência)
 * - Linhas pontilhadas de desvio padrão (faixa típica ±1 SD)
 * - Eixos rotulados ao redor
 */

export interface RadarAxis {
  /** Identificador interno */
  key: string;
  /** Label visível */
  label: string;
  /** Valor 1-5 do perfil individual */
  value: number;
  /** Média populacional 1-5 */
  norm: number;
  /** Desvio padrão (pra faixa típica) */
  sd: number;
}

interface Props {
  axes: RadarAxis[];
  /** Tamanho do SVG (quadrado) */
  size?: number;
  /** Título exibido fora do gráfico */
  title?: string;
  /** Cor da área do perfil */
  fillColor?: string;
}

export function RadarChart({
  axes,
  size = 480,
  title,
  fillColor = "#ff6a00",
}: Props) {
  if (axes.length === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const padding = 80; // espaço pros labels
  const radius = (size - padding * 2) / 2;
  const minVal = 1;
  const maxVal = 5;

  function pointFor(angle: number, value: number): [number, number] {
    const r = ((value - minVal) / (maxVal - minVal)) * radius;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  // ângulos: começa no topo (-90deg) e vai sentido horário
  const N = axes.length;
  const angles = axes.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / N);

  // Polígono individual (área preenchida)
  const profilePoints = angles
    .map((a, i) => pointFor(a, axes[i].value).join(","))
    .join(" ");

  // Polígono de norma (linha de referência)
  const normPoints = angles
    .map((a, i) => pointFor(a, axes[i].norm).join(","))
    .join(" ");

  // Polígonos de desvio padrão (faixa típica)
  const sdHighPoints = angles
    .map((a, i) => pointFor(a, axes[i].norm + axes[i].sd).join(","))
    .join(" ");
  const sdLowPoints = angles
    .map((a, i) => pointFor(a, axes[i].norm - axes[i].sd).join(","))
    .join(" ");

  // Anéis concêntricos (1, 2, 3, 4, 5)
  const rings = [1, 2, 3, 4, 5].map((v) => ({
    value: v,
    points: angles.map((a) => pointFor(a, v).join(",")).join(" "),
  }));

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold mb-2 opacity-80">{title}</h3>}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto"
        style={{ maxHeight: size }}
      >
        {/* Anéis de fundo */}
        {rings.map((ring, idx) => (
          <polygon
            key={idx}
            points={ring.points}
            fill="none"
            stroke="currentColor"
            strokeOpacity={ring.value === 3 ? 0.25 : 0.08}
            strokeWidth={ring.value === 3 ? 1.5 : 1}
          />
        ))}

        {/* Eixos radiais */}
        {angles.map((a, i) => {
          const [x, y] = pointFor(a, maxVal);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          );
        })}

        {/* Faixa de desvio padrão (área pontilhada) */}
        <polygon
          points={sdHighPoints}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <polygon
          points={sdLowPoints}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {/* Perfil individual (área preenchida) */}
        <polygon
          points={profilePoints}
          fill={fillColor}
          fillOpacity={0.35}
          stroke={fillColor}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Linha de norma (preto bold) */}
        <polygon
          points={normPoints}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.7}
          strokeWidth={2}
        />

        {/* Pontos do perfil individual */}
        {angles.map((a, i) => {
          const [x, y] = pointFor(a, axes[i].value);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3.5}
              fill={fillColor}
              stroke="white"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Labels dos eixos */}
        {angles.map((a, i) => {
          const labelR = radius + 24;
          const x = cx + labelR * Math.cos(a);
          const y = cy + labelR * Math.sin(a);
          // Anchor depende do quadrante
          let anchor: "start" | "middle" | "end" = "middle";
          const cosA = Math.cos(a);
          if (cosA > 0.3) anchor = "start";
          else if (cosA < -0.3) anchor = "end";
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={11}
              fill="currentColor"
              opacity={0.85}
              style={{ fontWeight: 600 }}
            >
              {axes[i].label}
            </text>
          );
        })}
      </svg>

      {/* Legenda */}
      <div className="flex items-center gap-4 mt-3 text-[10px] opacity-70 flex-wrap">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ background: fillColor, opacity: 0.4, border: `1.5px solid ${fillColor}` }}
          />
          Perfil individual
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-0 border-t-2 border-current" />
          Média populacional
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="w-3 h-0 border-t border-current opacity-50"
            style={{ borderStyle: "dashed" }}
          />
          ±1 desvio padrão
        </span>
      </div>
    </div>
  );
}
