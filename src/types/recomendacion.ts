export interface Recomendacion {
  id?: number;
  titulo: string;
  resumen?: string | null;
  contenidoHtml: string;
  prioridad: number;
  orden: number;
  publicado: boolean;
  fechaActualizacion?: string;
}
