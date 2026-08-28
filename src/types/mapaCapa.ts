export interface MapaCapa {
  id?: number;
  nombre: string;
  descripcion?: string | null;
  grupo?: string | null;
  tipo?: string | null;
  color: string;
  opacidad: number;
  visibleInicialmente: boolean;
  orden: number;
  publicado: boolean;
  fuente?: string | null;
  recomendaciones?: string | null;
  mostrarPdf: boolean;
  eliminarPdf?: boolean;
  nombreArchivoMapa?: string | null;
  nombreArchivoPdf?: string | null;
  tienePdf?: boolean;
  fechaActualizacion?: string;
  archivos?: MapaCapaArchivo[];
  configuracionLineas?: MapaLineaConfig[];
}

export interface MapaLineaConfig {
  clave: string;
  mostrarFlechas: boolean;
  sentidoInvertido: boolean;
  separacion: number;
}

export interface MapaCapaArchivo {
  id: number;
  tipo: "IMAGEN" | "PDF";
  mimeType: string;
  nombreArchivo: string;
  titulo?: string | null;
  orden: number;
  visible: boolean;
}
