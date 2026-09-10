import http from "../service/http-common";
import { URL_API } from "../service/constantes";
import authHeader from "../service/auth-header";
import  { PageResp } from "../types/page";
import type { ComunicadoDTO, CategoriaComu } from "../types/comunicado";

const BASE = `${URL_API}/v1/comunicados`;
const CATEG = `${URL_API}/v1/categorias-comunicados`; // 👈 ruta real
const PUSH = `${URL_API}/v1/push/comunicado`;

function unwrap<T>(res: any): T {
  return res?.data?.data as T;
}

export async function comunicadosPaged(params?: {
  page?: number;
  size?: number;
  sort?: string;
  dir?: "ASC" | "DESC";
}): Promise<PageResp<ComunicadoDTO>> {
  const { page = 0, size = 10, sort, dir } = params || {};
  const res = await http.get(BASE, {
    headers: authHeader(),
    params: { page, size, sort, dir },
  });
  return unwrap<PageResp<ComunicadoDTO>>(res);
}

export async function comunicadoGet(id: number): Promise<ComunicadoDTO> {
  const res = await http.get(`${BASE}/${id}`, { headers: authHeader() });
  return unwrap<ComunicadoDTO>(res);
}

export async function comunicadoCreate(dto: Partial<ComunicadoDTO>, sound?: "default" | "sirena"): Promise<ComunicadoDTO> {
  const res = await http.post(BASE, dto, { headers: authHeader() });
  const saved = unwrap<ComunicadoDTO>(res);
  if (sound && saved.estado) await http.post(`${PUSH}/${saved.idcomunicado}`, { sound }, { headers: authHeader() });
  return saved;
}

export async function comunicadoUpdate(id: number, dto: Partial<ComunicadoDTO>, sound?: "default" | "sirena"): Promise<ComunicadoDTO> {
  const res = await http.put(`${BASE}/${id}`, dto, { headers: authHeader() });
  const saved = unwrap<ComunicadoDTO>(res);
  if (sound && saved.estado) await http.post(`${PUSH}/${saved.idcomunicado}`, { sound }, { headers: authHeader() });
  return saved;
}

export async function comunicadoPush(id: number, sound: "default" | "sirena"): Promise<void> {
  await http.post(`${PUSH}/${id}`, { sound }, { headers: authHeader() });
}

export async function comunicadoUploadImagen(id: number, imagen: File): Promise<ComunicadoDTO> {
  const formData = new FormData();
  formData.append("imagen", imagen);
  const res = await http.post(`${BASE}/${id}/imagen`, formData, {
    headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
  });
  return unwrap<ComunicadoDTO>(res);
}

export async function comunicadoDeleteImagen(id: number): Promise<ComunicadoDTO> {
  const res = await http.delete(`${BASE}/${id}/imagen`, { headers: authHeader() });
  return unwrap<ComunicadoDTO>(res);
}

export async function comunicadoDelete(id: number): Promise<void> {
  await http.delete(`${BASE}/${id}`, { headers: authHeader() });
}

export async function categoriasComuAll(): Promise<CategoriaComu[]> {
  const res = await http.get(CATEG, { headers: authHeader() });
  return unwrap<CategoriaComu[]>(res);
}
