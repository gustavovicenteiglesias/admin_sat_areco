// Tipado 1:1 con tu entidad del backend
export interface Situacion {
  id: number;
  hora: string | null;                    // viene como "HH:mm:ss" (Time SQL)
  fecha: string | null;                   // ISO "YYYY-MM-DD" (LocalDate)
  altura: number | null;
  situacion: string | null;
  estado_compuertas: string | null;
  estado_compuertas_porciento: string | null;
  updatedAt: string | null;               // ISO datetime del backend
}
