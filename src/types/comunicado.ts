export interface ComunicadoDTO {
  idcomunicado: number;
  hora: string;          // "HH:mm:ss"
  fecha: string;         // "YYYY-MM-DD"
  titulo: string;
  alerta?: string | null;
  contenido?: string | null;
  fuente?: string | null;
  estado: boolean;
  idCategoria: number;   // Long en back, number en TS
  tieneImagen?: boolean | null;
  imagenMimeType?: string | null;
  imagenNombre?: string | null;

  // Solo lectura (decorativos)
  categoriaNombre?: string | null;
  categoriaColor?: string | null;
  categoriaColorNumero?: string | null;
  categoriaColorP?: string | null;
}

export interface CategoriaComu {
  idCategoria: number;         // 👈 match con tu entity/controller
  nombre: string;
  color?: string | null;
  colorNumero?: string | null;
  colorP?: string | null;
}
