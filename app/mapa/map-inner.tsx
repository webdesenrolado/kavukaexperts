"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { HeatmapLayer, type HeatPoint } from "@/components/heatmap-layer";
import Link from "next/link";

type Company = {
  id: string;
  name: string;
  lat: string | null;
  lng: string | null;
};

type Candidate = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  lat: string | null;
  lng: string | null;
};

type Application = {
  candidateId: string;
  jobId: string;
  stage: string;
};

const BR_CENTER: [number, number] = [-15.78, -47.92];
const SP_CENTER: [number, number] = [-23.55, -46.63];

function parseLat(s: string | null): number | null {
  if (!s) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export function MapInner({
  companies,
  candidates,
  heatPoints,
  selectedJobIds,
  applications,
  showLines,
}: {
  companies: Company[];
  candidates: Candidate[];
  heatPoints: Candidate[];
  selectedJobIds: Set<string>;
  applications: Application[];
  showLines: boolean;
}) {
  const candWithCoords = candidates.flatMap((c) => {
    const lat = parseLat(c.lat);
    const lng = parseLat(c.lng);
    return lat !== null && lng !== null ? [{ ...c, _lat: lat, _lng: lng }] : [];
  });

  const compWithCoords = companies.flatMap((c) => {
    const lat = parseLat(c.lat);
    const lng = parseLat(c.lng);
    return lat !== null && lng !== null ? [{ ...c, _lat: lat, _lng: lng }] : [];
  });

  const heatData: HeatPoint[] = heatPoints.flatMap((c) => {
    const lat = parseLat(c.lat);
    const lng = parseLat(c.lng);
    return lat !== null && lng !== null ? ([[lat, lng, 1]] as HeatPoint[]) : [];
  });

  // Linhas: pra cada vaga selecionada, conecta empresa → candidatos
  const lines: { from: [number, number]; to: [number, number] }[] = [];
  if (showLines && selectedJobIds.size > 0 && compWithCoords.length > 0) {
    const companyPoint = compWithCoords[0];
    const candIds = new Set(candWithCoords.map((c) => c.id));
    const filteredApps = applications.filter(
      (a) => selectedJobIds.has(a.jobId) && candIds.has(a.candidateId)
    );
    for (const a of filteredApps) {
      const cand = candWithCoords.find((c) => c.id === a.candidateId);
      if (cand) {
        lines.push({
          from: [companyPoint._lat, companyPoint._lng],
          to: [cand._lat, cand._lng],
        });
      }
    }
  }

  // Bounds adaptativo
  const allPoints = [
    ...candWithCoords.map((c) => [c._lat, c._lng] as [number, number]),
    ...compWithCoords.map((c) => [c._lat, c._lng] as [number, number]),
  ];
  let center = SP_CENTER;
  let bounds: [[number, number], [number, number]] | undefined;
  if (allPoints.length > 0) {
    const lats = allPoints.map((p) => p[0]);
    const lngs = allPoints.map((p) => p[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    center = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
    const padLat = Math.max(0.1, (maxLat - minLat) * 0.15);
    const padLng = Math.max(0.1, (maxLng - minLng) * 0.15);
    bounds = [
      [minLat - padLat, minLng - padLng],
      [maxLat + padLat, maxLng + padLng],
    ];
  }

  return (
    <MapContainer
      center={center}
      bounds={bounds}
      zoom={6}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", background: "#0a0a0b" }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="© OpenStreetMap · © CARTO"
      />

      {heatData.length > 0 && <HeatmapLayer points={heatData} radius={28} blur={22} minOpacity={0.35} />}

      {showLines &&
        lines.map((line, i) => (
          <Polyline
            key={`line-${i}`}
            positions={[line.from, line.to]}
            pathOptions={{ color: "#ff6a00", weight: 1, opacity: 0.25, dashArray: "3,6" }}
          />
        ))}

      {candWithCoords.map((c) => (
        <CircleMarker
          key={c.id}
          center={[c._lat, c._lng]}
          radius={5}
          pathOptions={{
            color: "#0ea5e9",
            fillColor: "#0ea5e9",
            fillOpacity: 0.7,
            weight: 1,
          }}
        >
          <Tooltip direction="top">
            <div className="text-xs">
              <div className="font-bold">{c.name}</div>
              {c.city && (
                <div className="opacity-70">
                  {c.city}
                  {c.state && `/${c.state}`}
                </div>
              )}
            </div>
          </Tooltip>
        </CircleMarker>
      ))}

      {compWithCoords.map((c) => (
        <CircleMarker
          key={c.id}
          center={[c._lat, c._lng]}
          radius={11}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#ff6a00",
            fillOpacity: 0.95,
            weight: 2,
          }}
        >
          <Tooltip direction="top" permanent={false}>
            <div className="text-xs">
              <div className="font-bold">{c.name}</div>
              <div className="opacity-70">empresa</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
