import http from "../service/http-common";
import { URL_API } from "../service/constantes";
import authHeader from "../service/auth-header";
import type { IntervalDTO, HidricosDTO } from "../types/settings";

const BASE = `${URL_API}/v1/settings`;

function unwrap<T>(res: any): T {
  return res?.data?.data as T;
}

// ---------- RÍO ----------
export async function getRioInterval(): Promise<IntervalDTO> {
  const res = await http.get(`${BASE}/ingestion/rio/interval`, { headers: authHeader() });
  return unwrap<IntervalDTO>(res);
}
export async function putRioInterval(ms: number, user?: string): Promise<IntervalDTO> {
  const res = await http.put(
    `${BASE}/ingestion/rio/interval`,
    { ms },
    { headers: authHeader() }
  );
  return unwrap<IntervalDTO>(res);
}

// ---------- LLUVIA ----------
export async function getLluviaDay(): Promise<IntervalDTO> {
  const res = await http.get(`${BASE}/ingestion/lluvia/day`, { headers: authHeader() });
  return unwrap<IntervalDTO>(res);
}
export async function putLluviaDay(ms: number): Promise<IntervalDTO> {
  const res = await http.put(
    `${BASE}/ingestion/lluvia/day`,
    { ms },
    { headers: authHeader() }
  );
  return unwrap<IntervalDTO>(res);
}

export async function getLluviaNight(): Promise<IntervalDTO> {
  const res = await http.get(`${BASE}/ingestion/lluvia/night`, { headers: authHeader() });
  return unwrap<IntervalDTO>(res);
}
export async function putLluviaNight(ms: number): Promise<IntervalDTO> {
  const res = await http.put(
    `${BASE}/ingestion/lluvia/night`,
    { ms },
    { headers: authHeader() }
  );
  return unwrap<IntervalDTO>(res);
}

// ---------- HÍDRICOS ----------
export async function getHidricos(): Promise<HidricosDTO> {
  const res = await http.get(`${BASE}/hidricos`, { headers: authHeader() });
  return unwrap<HidricosDTO>(res);
}
export async function putHidricos(body: HidricosDTO): Promise<HidricosDTO> {
  const res = await http.put(
    `${BASE}/hidricos`,
    body,
    { headers: authHeader() }
  );
  return unwrap<HidricosDTO>(res);
}
// ---------- INGESTION ENABLED FLAGS ----------

// 🌧️ LLUVIA
export async function getLluviaEnabled(): Promise<boolean> {
  const res = await http.get(
    `${URL_API}/v1/ingestion/lluvia/enabled`,
    { headers: authHeader() }
  );
  return unwrap<{ enabled: boolean }>(res).enabled;
}

export async function putLluviaEnabled(enabled: boolean): Promise<boolean> {
  const res = await http.put(
    `${URL_API}/v1/ingestion/lluvia/enabled`,
    { enabled },
    { headers: authHeader() }
  );
  return unwrap<{ enabled: boolean }>(res).enabled;
}

// 🌊 RÍO
export async function getRioEnabled(): Promise<boolean> {
  const res = await http.get(
    `${URL_API}/v1/ingestion/rio/enabled`,
    { headers: authHeader() }
  );
  return unwrap<{ enabled: boolean }>(res).enabled;
}

export async function putRioEnabled(enabled: boolean): Promise<boolean> {
  const res = await http.put(
    `${URL_API}/v1/ingestion/rio/enabled`,
    { enabled },
    { headers: authHeader() }
  );
  return unwrap<{ enabled: boolean }>(res).enabled;
}
