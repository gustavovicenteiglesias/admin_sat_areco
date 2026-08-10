import http from "../service/http-common";       // ajustá la ruta si cambia
import { URL_API } from "../service/constantes"; // idem
import authHeader from "../service/auth-header";     // idem
import type { Situacion } from "../types/situacion";
import { PageResp } from "../types/page";

// Helper para extraer el "data" real (ApiResponse<T>)
function unwrap<T>(res: any): T {
  return res?.data?.data as T;
}

const BASE = `${URL_API}/v1/situaciones`;
// /v1/situaciones?page=0&size=20&sort=updatedAt&dir=DESC
export async function situacionesPaged(params?: {
  page?: number;
  size?: number;
  sort?: string;
  dir?: "ASC" | "DESC";
}): Promise<PageResp<Situacion>> {
  const { page = 0, size = 5, sort = "updatedAt", dir = "DESC" } = params || {};
  const res = await http.get(`${BASE}`, {
    headers: authHeader(),
    params: { page, size, sort, dir },
  });
  return unwrap<PageResp<Situacion>>(res);
}

export async function situacionesAll(): Promise<Situacion[]> {
  const res = await http.get(`${BASE}`, { headers: authHeader() });
  return unwrap<Situacion[]>(res);
}

export async function situacionGet(id: number): Promise<Situacion> {
  const res = await http.get(`${BASE}/${id}`, { headers: authHeader() });
  return unwrap<Situacion>(res);
}

export async function situacionGetUltimo(): Promise<Situacion> {
  const res = await http.get(`${BASE}/ultimo`, { headers: authHeader() });
  return unwrap<Situacion>(res);
}

export async function situacionCreate(payload: Partial<Situacion>): Promise<Situacion> {
  const res = await http.post(`${BASE}`, payload, { headers: authHeader() });
  return unwrap<Situacion>(res);
}

export async function situacionUpdate(id: number, payload: Partial<Situacion>): Promise<Situacion> {
  const res = await http.put(`${BASE}/${id}`, payload, { headers: authHeader() });
  return unwrap<Situacion>(res);
}

export async function situacionDelete(id: number): Promise<void> {
  await http.delete(`${BASE}/${id}`, { headers: authHeader() });
}
