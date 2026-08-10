// src/data/cortoplazo.repo.ts
import http from "../service/http-common";
import { URL_API } from "../service/constantes";
import authHeader from "../service/auth-header";
import type { CortoPlazo } from "../types/cortoplazo";

function unwrap<T>(res: any): T {
  return res?.data?.data as T;
}

const BASE = `${URL_API}/v1/cortoplazo`;
const PUSH = `${URL_API}/v1/push/send/cortoplazo`;

export async function cpVigentes(): Promise<CortoPlazo[]> {
  const res = await http.get(`${BASE}/vigentes`, { headers: authHeader() });
  return unwrap<CortoPlazo[]>(res);
}

export async function cpGet(id: number): Promise<CortoPlazo> {
  const res = await http.get(`${BASE}/${id}`, { headers: authHeader() });
  return unwrap<CortoPlazo>(res);
}

export async function cpCreate(payload: Partial<CortoPlazo>, firePushIfActive = true): Promise<CortoPlazo> {
  const res = await http.post(`${BASE}`, payload, { headers: authHeader() });
  const saved = unwrap<CortoPlazo>(res);
  if (firePushIfActive && saved?.estado) {
    await http.post(`${PUSH}/${saved.id}`, {}, { headers: authHeader() });
  }
  return saved;
}

/** Update que SOLO dispara push si pasa de inactivo->activo */
export async function cpUpdateSmart(
  id: number,
  payload: Partial<CortoPlazo>,
  prevEstado: boolean,
  newEstado: boolean
): Promise<CortoPlazo> {
  const res = await http.put(`${BASE}/${id}`, payload, { headers: authHeader() });
  const updated = unwrap<CortoPlazo>(res);

  // Dispara push sólo si ANTES estaba inactivo y AHORA activo
  if (!prevEstado && newEstado) {
    await http.post(`${PUSH}/${updated.id}`, {}, { headers: authHeader() });
  }
  return updated;
}

export async function cpDelete(id: number): Promise<void> {
  await http.delete(`${BASE}/${id}`, { headers: authHeader() });
}
