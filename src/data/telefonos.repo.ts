import http from "../service/http-common";
import { URL_API } from "../service/constantes";
import authHeader from "../service/auth-header";
import type { Telefono } from "../types/telefono";

const BASE = `${URL_API}/v1/telefonos`;

function unwrap<T>(res: any): T {
  return res?.data?.data as T;
}

/**
 * Lista SOLO activos, ya ordenados por 'orden' (null al final) y descripción.
 * GET /v1/telefonos
 */
export async function telefonosList(): Promise<Telefono[]> {
  const res = await http.get(BASE, { headers: authHeader() });
  return unwrap<Telefono[]>(res);
}

/**
 * Obtener por ID (incluye borrados lógicos si existen)
 * GET /v1/telefonos/{id}
 */
export async function telefonoGet(id: number): Promise<Telefono> {
  const res = await http.get(`${BASE}/${id}`, { headers: authHeader() });
  return unwrap<Telefono>(res);
}

/**
 * Crear (el backend setea estado=true si no viene)
 * POST /v1/telefonos
 */
export async function telefonoCreate(payload: Partial<Telefono>): Promise<Telefono> {
  const res = await http.post(BASE, payload, { headers: authHeader() });
  return unwrap<Telefono>(res);
}

/**
 * Actualizar completo (solo si está activo en backend)
 * PUT /v1/telefonos/{id}
 */
export async function telefonoUpdate(id: number, payload: Partial<Telefono>): Promise<Telefono> {
  const res = await http.put(`${BASE}/${id}`, payload, { headers: authHeader() });
  return unwrap<Telefono>(res);
}

/**
 * Borrado lógico (estado=false)
 * DELETE /v1/telefonos/{id}
 */
export async function telefonoDelete(id: number): Promise<void> {
  await http.delete(`${BASE}/${id}`, { headers: authHeader() });
}

/**
 * Actualizar SOLO el orden de un registro
 * PUT /v1/telefonos/{id}/orden
 */
export async function telefonoUpdateOrden(id: number, orden: number | null): Promise<Telefono> {
  const res = await http.put(
    `${BASE}/${id}/orden`,
    { id, orden },
    { headers: authHeader() }
  );
  return unwrap<Telefono>(res);
}

/**
 * Reordenamiento en lote (drag & drop)
 * Body: [{ id, orden }, ...]
 * PUT /v1/telefonos/orden
 * Devuelve la lista activa ya ordenada (para refrescar la UI).
 */
export type TelefonoOrdenItem = { id: number; orden: number | null };

export async function telefonosUpdateOrdenBatch(items: TelefonoOrdenItem[]): Promise<Telefono[]> {
  const res = await http.put(`${BASE}/orden`, items, { headers: authHeader() });
  return unwrap<Telefono[]>(res);
}
