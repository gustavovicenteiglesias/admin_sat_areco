import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-polylinedecorator";
import "leaflet/dist/leaflet.css";
import type { MapaLineaConfig } from "../types/mapaCapa";

type Props = { geojson: GeoJSON.GeoJsonObject; color: string; opacidad: number; configuracionLineas?: MapaLineaConfig[] };
const escapar = (value: unknown) => String(value ?? "").replace(/[&<>'\"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '\"': "&quot;" })[char]!);
const SEPARACION_FLECHAS_PX = 70;
const contraste = (color: string) => {
  const hex = /^#[0-9a-f]{6}$/i.test(color) ? color.slice(1) : "3388ff";
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#222222" : "#ffffff";
};

export default function MapaPreview({ geojson, color, opacidad, configuracionLineas = [] }: Props) {
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!element.current) return;
    const map = L.map(element.current).setView([-34.25, -59.47], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);
    const layer = L.geoJSON(geojson, {
      style: feature => {
        const estilo = feature?.properties?.estilo ?? {};
        return { color: estilo.contorno === false ? "transparent" : (estilo.color ?? color), opacity: estilo.opacidadLinea ?? 1, fillColor: estilo.relleno ?? color, fillOpacity: estilo.rellenar === false ? 0 : (estilo.opacidad ?? opacidad), weight: estilo.ancho ?? 3 };
      },
      pointToLayer: (feature, latlng) => {
        const estilo = feature.properties?.estilo ?? {};
        if (estilo.icono) {
          const size = Math.round(32 * (estilo.escalaIcono ?? 1));
          return L.marker(latlng, { icon: L.icon({ iconUrl: estilo.icono, iconSize: [size, size], iconAnchor: [size / 2, size] }) });
        }
        return L.circleMarker(latlng, { radius: 7, color: estilo.color ?? color, fillColor: estilo.relleno ?? color, fillOpacity: 1 });
      },
      onEachFeature: (feature, item) => {
        const nombre = feature.properties?.nombre;
        const descripcion = feature.properties?.descripcion;
        if (nombre || descripcion) item.bindPopup(`<strong>${escapar(nombre)}</strong>${descripcion ? `<br>${escapar(descripcion)}` : ""}`);
        if (nombre && feature.geometry?.type === "Point") item.bindTooltip(escapar(nombre), { permanent: true, direction: "top" });
        if (feature.geometry?.type === "LineString" && item instanceof L.Polyline) {
          const features = geojson.type === "FeatureCollection" ? geojson.features : [];
          const indice = features.indexOf(feature as GeoJSON.Feature);
          const clave = String(feature.properties?.elementoId ?? `linea-${indice}`);
          const config = configuracionLineas.find(linea => linea.clave === clave);
          const mostrar = config?.mostrarFlechas ?? String(nombre ?? "").trim().startsWith("Vía de Evacuación");
          if (!mostrar) return;
          const estilo = feature.properties?.estilo ?? {};
          const recorrido = config?.sentidoInvertido ? [...(item.getLatLngs() as L.LatLng[])].reverse() : item;
          (L as any).polylineDecorator(recorrido, {
            patterns: [{ offset: 24, repeat: config?.separacion ?? SEPARACION_FLECHAS_PX, symbol: (L as any).Symbol.arrowHead({ pixelSize: 14, polygon: true, pathOptions: { color: contraste(estilo.color ?? color), fillColor: estilo.color ?? color, fillOpacity: 1, weight: 1.5, opacity: 1 } }) }],
          }).addTo(map);
        }
      },
    }).addTo(map);
    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
    setTimeout(() => map.invalidateSize(), 0);
    return () => map.remove();
  }, [geojson, color, opacidad, configuracionLineas]);

  return <div ref={element} style={{ height: 420, width: "100%", borderRadius: 8 }} />;
}
