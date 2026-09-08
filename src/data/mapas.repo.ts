import http from "../service/http-common";
import { URL_API } from "../service/constantes";
import authHeader from "../service/auth-header";
import type { MapaCapa, MapaCapaArchivo } from "../types/mapaCapa";

const BASE = `${URL_API}/v1/admin/mapas/capas`;
const unwrap = <T,>(res: any): T => res?.data?.data as T;

export async function mapasList(): Promise<MapaCapa[]> {
  return unwrap((await http.get(BASE, { headers: authHeader() })));
}

export async function mapaGet(id: number): Promise<MapaCapa> {
  return unwrap((await http.get(`${BASE}/${id}`, { headers: authHeader() })));
}

export async function mapaGeojson(id: number): Promise<GeoJSON.GeoJsonObject> {
  return (await http.get(`${BASE}/${id}/geojson`, { headers: authHeader() })).data;
}

function formData(metadata: MapaCapa, mapa?: File | null, archivos?: File[]) {
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  if (mapa) form.append("mapa", mapa);
  archivos?.forEach(archivo => form.append("archivos", archivo));
  return form;
}

function multipartHeaders() {
  return { ...authHeader(), "Content-Type": "multipart/form-data" };
}

export async function mapaCreate(metadata: MapaCapa, mapa: File, archivos?: File[]): Promise<MapaCapa> {
  const res = await http.post(BASE, formData(metadata, mapa, archivos), { headers: multipartHeaders() });
  return unwrap(res);
}

export async function mapaUpdate(id: number, metadata: MapaCapa, mapa?: File | null, archivos?: File[]): Promise<MapaCapa> {
  const res = await http.put(`${BASE}/${id}`, formData(metadata, mapa, archivos), { headers: multipartHeaders() });
  return unwrap(res);
}

export async function mapaDelete(id: number): Promise<void> {
  await http.delete(`${BASE}/${id}`, { headers: authHeader() });
}

export async function mapaArchivoDelete(capaId: number, archivoId: number): Promise<void> {
  await http.delete(`${BASE}/${capaId}/archivos/${archivoId}`, { headers: authHeader() });
}

export async function mapaArchivoUpdate(capaId: number, archivo: MapaCapaArchivo): Promise<MapaCapaArchivo> {
  return unwrap(await http.patch(`${BASE}/${capaId}/archivos/${archivo.id}`, {
    titulo: archivo.titulo ?? "",
    visible: archivo.visible,
  }, { headers: authHeader() }));
}

export async function mapaArchivosOrden(capaId: number, archivos: MapaCapaArchivo[]): Promise<MapaCapaArchivo[]> {
  const items = archivos.map((archivo, orden) => ({ id: archivo.id, orden }));
  return unwrap(await http.put(`${BASE}/${capaId}/archivos/orden`, items, { headers: authHeader() }));
}
