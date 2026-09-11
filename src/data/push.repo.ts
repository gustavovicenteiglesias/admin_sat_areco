import http from "../service/http-common";
import authHeader from "../service/auth-header";

export type PushDeviceSubscription = {
  topic: string;
  active: boolean;
  updatedAt?: string;
};

export type PushDevice = {
  id: number;
  installationId: string;
  alias?: string | null;
  platform: string;
  model?: string | null;
  appVersion?: string | null;
  appBuild?: string | null;
  isTest: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastSeenAt?: string;
  subscriptions: PushDeviceSubscription[];
};

export type PushDeviceFilters = {
  platform?: string;
  isTest?: boolean;
  active?: boolean;
};

export type PushDeviceTestRequest = {
  titulo?: string;
  contenido?: string;
  deeplink?: string;
  tipo?: string;
  sirena: boolean;
};

export async function pushDevicesList(filters: PushDeviceFilters = {}): Promise<PushDevice[]> {
  const params = new URLSearchParams();
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.isTest !== undefined) params.set("isTest", String(filters.isTest));
  if (filters.active !== undefined) params.set("active", String(filters.active));

  const query = params.toString();
  const response = await http.get(`/v1/admin/push/devices${query ? `?${query}` : ""}`, {
    headers: authHeader(),
  });
  return response.data?.data ?? [];
}

export async function pushDeviceUpdate(
  id: number,
  payload: Pick<PushDevice, "alias" | "isTest" | "active">
): Promise<PushDevice> {
  const response = await http.patch(`/v1/admin/push/devices/${id}`, payload, {
    headers: authHeader(),
  });
  return response.data?.data;
}

export async function enviarPushDePruebaADispositivo(
  id: number,
  payload: PushDeviceTestRequest
): Promise<string | undefined> {
  const response = await http.post(`/v1/admin/push/devices/${id}/test`, payload, {
    headers: authHeader(),
  });
  return response.data?.data?.messageId;
}
