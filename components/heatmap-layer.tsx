"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

export type HeatPoint = [number, number, number?]; // [lat, lng, intensity?]

interface HeatLayerProps {
  points: HeatPoint[];
  radius?: number;
  blur?: number;
  maxZoom?: number;
  minOpacity?: number;
  gradient?: Record<number, string>;
}

export function HeatmapLayer({
  points,
  radius = 30,
  blur = 25,
  maxZoom = 17,
  minOpacity = 0.3,
  gradient,
}: HeatLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    // @ts-expect-error leaflet.heat extends L
    const layer = L.heatLayer(points, {
      radius,
      blur,
      maxZoom,
      minOpacity,
      gradient: gradient || {
        0.0: "#0ea5e9",
        0.4: "#10b981",
        0.7: "#ffcc00",
        1.0: "#ff6a00",
      },
    }).addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, points, radius, blur, maxZoom, minOpacity, gradient]);

  return null;
}
