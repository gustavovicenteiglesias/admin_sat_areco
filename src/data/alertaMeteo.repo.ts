import http from "../service/http-common";
import { URL_API } from "../service/constantes";
import authHeader from "../service/auth-header";
import type { AlertaMeteo } from "../types/alertaMeteo";

const BASE = `${URL_API}/v1/alertameteorologica`;
const PUSH = `${URL_API}/v1/push/meteo`;

function unwrap<T>(res: any): T {
  return res?.data?.data as T;
}

export async function meteoVigentes(): Promise<AlertaMeteo[]> {
  const res = await http.get(`${BASE}/vigentes`, { headers: authHeader() });
  return unwrap<AlertaMeteo[]>(res);
}

export async function meteoGet(id: number): Promise<AlertaMeteo> {
  const res = await http.get(`${BASE}/${id}`, { headers: authHeader() });
  return unwrap<AlertaMeteo>(res);
}

export async function meteoCreate(payload: Partial<AlertaMeteo>, firePushIfActive = true): Promise<AlertaMeteo> {
  const res = await http.post(`${BASE}`, payload, { headers: authHeader() });
  const saved = unwrap<AlertaMeteo>(res);
  if (firePushIfActive && saved?.estado) {
    await http.post(`${PUSH}/${saved.id}`, {}, { headers: authHeader() });
  }
  return saved;
}

/** Update que SOLO dispara push si pasa de inactivo -> activo */
export async function meteoUpdateSmart(
  id: number,
  payload: Partial<AlertaMeteo>,
  prevEstado: boolean,
  newEstado: boolean
): Promise<AlertaMeteo> {
  const res = await http.put(`${BASE}/${id}`, payload, { headers: authHeader() });
  const updated = unwrap<AlertaMeteo>(res);
  if (!prevEstado && newEstado) {
    await http.post(`${PUSH}/${updated.id}`, {}, { headers: authHeader() });
  }
  return updated;
}

export async function meteoDelete(id: number): Promise<void> {
  await http.delete(`${BASE}/${id}`, { headers: authHeader() });
}
