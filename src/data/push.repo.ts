import http from "../service/http-common";
import authHeader from "../service/auth-header";

export type PushTestRequest = {
  token: string;
  titulo?: string;
  contenido?: string;
  sirena: boolean;
};

export async function enviarPushDePrueba(payload: PushTestRequest): Promise<string | undefined> {
  const response = await http.post("/v1/admin/push/test-token", payload, {
    headers: authHeader(),
  });
  return response.data?.data?.messageId;
}
