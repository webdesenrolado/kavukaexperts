"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "./map-view";

const MapView = dynamic(() => import("./map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-xl border flex items-center justify-center text-sm opacity-60"
      style={{ height: 360, borderColor: "var(--border)", background: "var(--card)" }}
    >
      Carregando mapa...
    </div>
  ),
});

interface Props {
  points: MapPoint[];
  height?: number;
  drawLinesFromKind?: "company" | "job";
  className?: string;
}

export function MapViewLoader(props: Props) {
  return <MapView {...props} />;
}

export type { MapPoint };
