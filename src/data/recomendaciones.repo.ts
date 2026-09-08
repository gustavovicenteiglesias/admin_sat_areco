import http from "../service/http-common";
import { URL_API } from "../service/constantes";
import authHeader from "../service/auth-header";
import type { Recomendacion } from "../types/recomendacion";

const BASE = `${URL_API}/v1/admin/recomendaciones`;
const unwrap = <T,>(res: any): T => res?.data?.data as T;

export const recomendacionesList = async () => unwrap<Recomendacion[]>(await http.get(BASE, { headers: authHeader() }));
export const recomendacionGet = async (id: number) => unwrap<Recomendacion>(await http.get(`${BASE}/${id}`, { headers: authHeader() }));
export const recomendacionCreate = async (item: Recomendacion) => unwrap<Recomendacion>(await http.post(BASE, item, { headers: authHeader() }));
export const recomendacionUpdate = async (id: number, item: Recomendacion) => unwrap<Recomendacion>(await http.put(`${BASE}/${id}`, item, { headers: authHeader() }));
export const recomendacionDelete = async (id: number) => { await http.delete(`${BASE}/${id}`, { headers: authHeader() }); };
