export type PushMode = "none" | "default" | "sirena";
export type TipoAlerta = "AMARILLO" | "NARANJA" | "ROJO"; // extendé si hay más

export interface AlertaMeteo {
  id: number;
  hora: string;        // "HH:mm:ss"
  fecha: string;       // "YYYY-MM-DD"
  titulo: string;
  zona?: string | null;
  situacion?: string | null;
  estado: boolean;     // activa/inactiva
  tipo: TipoAlerta;    // enum
}
