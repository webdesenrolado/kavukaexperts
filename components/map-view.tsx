"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sublabel?: string;
  href?: string;
  kind: "company" | "candidate" | "candidate-star" | "job";
  score?: number;
}

interface MapViewProps {
  points: MapPoint[];
  height?: number;
  drawLinesFromKind?: "company" | "job"; // se passar, desenha linhas tracejadas dos candidatos até esse ponto
  className?: string;
}

const STYLE_BY_KIND: Record<MapPoint["kind"], { color: string; radius: number; fillOpacity: number }> = {
  company:        { color: "#ff6a00", radius: 14, fillOpacity: 0.9 },
  job:            { color: "#ffcc00", radius: 12, fillOpacity: 0.85 },
  "candidate-star": { color: "#10b981", radius: 11, fillOpacity: 0.85 },
  candidate:      { color: "#0ea5e9", radius: 8,  fillOpacity: 0.7 },
};

export function MapView({ points, height = 360, drawLinesFromKind, className }: MapViewProps) {
  if (points.length === 0) {
    return (
      <div
        className={`rounded-xl border flex items-center justify-center text-sm opacity-60 ${className ?? ""}`}
        style={{ height, borderColor: "var(--border)" }}
      >
        Sem coordenadas para exibir.
      </div>
    );
  }

  // Bounds: pega min/max lat/lng com leve padding
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const center: [number, number] = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
  const padLat = Math.max(0.01, (maxLat - minLat) * 0.3);
  const padLng = Math.max(0.01, (maxLng - minLng) * 0.3);
  const bounds: [[number, number], [number, number]] = [
    [minLat - padLat, minLng - padLng],
    [maxLat + padLat, maxLng + padLng],
  ];

  const anchor = drawLinesFromKind ? points.find((p) => p.kind === drawLinesFromKind) : null;
  const lineTargets = anchor ? points.filter((p) => p.id !== anchor.id) : [];

  return (
    <div
      className={`rounded-xl overflow-hidden border ${className ?? ""}`}
      style={{ height, borderColor: "var(--border)" }}
    >
      <MapContainer
        center={center}
        bounds={bounds}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "#0a0a0b" }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='© OpenStreetMap · © CARTO'
        />

        {anchor &&
          lineTargets.map((p) => (
            <Polyline
              key={`line-${p.id}`}
              positions={[
                [anchor.lat, anchor.lng],
                [p.lat, p.lng],
              ]}
              pathOptions={{ color: "#ff6a00", weight: 1, opacity: 0.4, dashArray: "5,8" }}
            />
          ))}

        {points.map((p) => {
          const s = STYLE_BY_KIND[p.kind];
          return (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={s.radius}
              pathOptions={{
                color: "#fff",
                weight: 2,
                fillColor: s.color,
                fillOpacity: s.fillOpacity,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                <div className="font-semibold text-xs">{p.label}</div>
                {p.sublabel && <div className="text-[10px] opacity-70">{p.sublabel}</div>}
                {typeof p.score === "number" && (
                  <div className="text-[10px] mt-0.5">
                    Score Humano: <strong>{p.score}</strong>
                  </div>
                )}
              </Tooltip>
              {p.href && (
                <Popup>
                  <div className="min-w-[180px]">
                    <div className="font-semibold text-sm">{p.label}</div>
                    {p.sublabel && <div className="text-xs opacity-70 mt-0.5">{p.sublabel}</div>}
                    {typeof p.score === "number" && (
                      <div className="text-xs mt-1">
                        Score Humano: <strong>{p.score}</strong>
                      </div>
                    )}
                    <a
                      href={p.href}
                      className="inline-block mt-2 text-xs px-2 py-1 rounded bg-[#ff6a00] text-white font-semibold"
                    >
                      Abrir perfil →
                    </a>
                  </div>
                </Popup>
              )}
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
