export interface Telefono {
  id?: number;              // Integer en backend
  numero: number;           // Long (10 dígitos AR entra en number)
  tipo?: string | null;
  descripcion?: string | null;
  estado?: boolean | null;  // true=activo, false=borrado lógico
  orden?: number | null;    // para ordenar (null => al final)
}
