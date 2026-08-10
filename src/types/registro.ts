export interface Registro {
  id: number;
  hora: string;            // "HH:mm:ss"
  fecha: string;           // "YYYY-MM-DD"
  lluvia_hoy: string | null;
  lluvia_ayer: string | null;
  lluvia_mes: string | null;
  lluvia_ano: string | null;

  idEstacion?: string | null;
  codigo?: number | null;
  source?: string | null;
  raw?: string | null;

  createdAt?: string | null; // ISO si el back lo serializa así
}
