"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ESPECTRA_COORDS, type Precisao } from "@/lib/geo";

type ClientePin = {
  id: string;
  nome: string;
  empresa: string | null;
  cidade: string | null;
  estado: string | null;
  coords: [number, number];
  precisao: Precisao;
};

const espectraIcon = L.divIcon({
  html: `<div style="
    width:16px;height:16px;
    background:rgba(99,102,241,0.9);
    border:2px solid #a5b4fc;
    border-radius:50%;
    box-shadow:0 0 12px 4px rgba(99,102,241,0.6),0 0 24px 8px rgba(99,102,241,0.3);
  "></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -12],
});

const clienteIcon = L.divIcon({
  html: `<div style="
    width:10px;height:10px;
    background:rgba(34,211,238,0.9);
    border:1.5px solid #67e8f9;
    border-radius:50%;
    box-shadow:0 0 8px 3px rgba(34,211,238,0.5),0 0 16px 6px rgba(34,211,238,0.2);
  "></div>`,
  className: "",
  iconSize: [10, 10],
  iconAnchor: [5, 5],
  popupAnchor: [0, -8],
});

const clienteIconAproximado = L.divIcon({
  html: `<div style="
    width:10px;height:10px;
    background:rgba(245,158,11,0.35);
    border:1.5px dashed #fbbf24;
    border-radius:50%;
    box-shadow:0 0 8px 3px rgba(245,158,11,0.35);
  "></div>`,
  className: "",
  iconSize: [10, 10],
  iconAnchor: [5, 5],
  popupAnchor: [0, -8],
});

export default function BrasilMap({ clientes }: { clientes: ClientePin[] }) {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .leaflet-container { background: #0a0f1e !important; }
      .leaflet-popup-content-wrapper {
        background: #0f172a;
        border: 1px solid rgba(99,102,241,0.3);
        border-radius: 8px;
        color: #e2e8f0;
        box-shadow: 0 0 20px rgba(99,102,241,0.2);
      }
      .leaflet-popup-tip { background: #0f172a; }
      .leaflet-popup-content { margin: 10px 14px; }
      .leaflet-control-zoom a {
        background: #0f172a !important;
        color: #a5b4fc !important;
        border-color: rgba(99,102,241,0.3) !important;
      }
      .leaflet-control-zoom a:hover { background: #1e293b !important; }
      .leaflet-control-attribution { display: none; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-border" style={{ height: "72vh" }}>
      <MapContainer
        center={[-14.5, -51.9]}
        zoom={4}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CartoDB'
        />
        <ZoomControl position="bottomright" />

        {/* Linhas de Pelotas → cada cliente */}
        {clientes.map((c) => (
          <Polyline
            key={`line-${c.id}`}
            positions={[ESPECTRA_COORDS, c.coords]}
            pathOptions={{
              color: "rgba(99,102,241,0.45)",
              weight: 1.2,
              dashArray: "4 8",
            }}
          />
        ))}

        {/* Marcadores dos clientes */}
        {clientes.map((c) => (
          <Marker
            key={c.id}
            position={c.coords}
            icon={c.precisao === "aproximada" ? clienteIconAproximado : clienteIcon}
          >
            <Popup>
              <p className="font-semibold" style={{ color: "#67e8f9", marginBottom: 2 }}>
                {c.nome}
              </p>
              {c.empresa && (
                <p style={{ color: "#94a3b8", fontSize: 12 }}>{c.empresa}</p>
              )}
              {(c.cidade || c.estado) && (
                <p style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>
                  {[c.cidade, c.estado].filter(Boolean).join(", ")}
                </p>
              )}
              {c.precisao === "aproximada" && (
                <p style={{ color: "#fbbf24", fontSize: 11, marginTop: 4 }}>
                  Localização aproximada
                </p>
              )}
            </Popup>
          </Marker>
        ))}

        {/* Marcador da Espectra */}
        <Marker position={ESPECTRA_COORDS} icon={espectraIcon}>
          <Popup>
            <p className="font-semibold" style={{ color: "#a5b4fc", marginBottom: 2 }}>
              Espectra
            </p>
            <p style={{ color: "#64748b", fontSize: 11 }}>Pelotas, RS</p>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
