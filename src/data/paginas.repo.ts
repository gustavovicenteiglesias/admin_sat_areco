import http from "../service/http-common";
import { URL_API } from "../service/constantes";
import authHeader from "../service/auth-header";
import type { PaginaContenido } from "../types/paginaContenido";
const URL = `${URL_API}/v1/admin/paginas/nosotros`;
export async function nosotrosGet():Promise<PaginaContenido|null>{const r=await http.get(URL,{headers:authHeader()});return r.data.data??null;}
export async function nosotrosPut(data:PaginaContenido):Promise<PaginaContenido>{const r=await http.put(URL,data,{headers:authHeader()});return r.data.data;}
