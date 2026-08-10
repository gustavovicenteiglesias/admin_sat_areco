import http from "../service/http-common";
import { URL_API } from "../service/constantes";
import authHeader from "../service/auth-header";
import type { PageResp } from "../types/page";
import type { Registro } from "../types/registro";

const BASE = `${URL_API}/v1/registros`;

function unwrap<T>(res: any): T {
  return res?.data?.data as T;
}

// GET paginado con sort por defecto: fecha desc, hora desc
export async function registrosPaged(params?: {
  page?: number;
  size?: number;
  sort?: string[]; // ej: ["fecha,desc","hora,desc"]
}): Promise<PageResp<Registro>> {
  const { page = 0, size = 20, sort } = params || {};
  const res = await http.get(BASE, {
    headers: authHeader(),
    params: {
      page,
      size,
      ...(sort ? { sort } : { sort: "fecha,desc" }),
    },
    // axios manda arrays como repetidos: ?sort=fecha,desc&sort=hora,desc
  });
  return unwrap<PageResp<Registro>>(res);
}

export async function registroGet(id: number): Promise<Registro> {
  const res = await http.get(`${BASE}/${id}`, { headers: authHeader() });
  return unwrap<Registro>(res);
}

export async function registroCreate(payload: Partial<Registro>): Promise<Registro> {
  const res = await http.post(BASE, payload, { headers: authHeader() });
  return unwrap<Registro>(res);
}

export async function registroUpdate(id: number, payload: Partial<Registro>): Promise<Registro> {
  const res = await http.put(`${BASE}/${id}`, payload, { headers: authHeader() });
  return unwrap<Registro>(res);
}

export async function registroDelete(id: number): Promise<void> {
  await http.delete(`${BASE}/${id}`, { headers: authHeader() });
}
