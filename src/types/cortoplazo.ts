export interface CortoPlazo {
  id: number;
  hora: string | null;     // "HH:mm:ss"
  fecha: string | null;    // "YYYY-MM-DD"
  titulo: string | null;
  contenido: string | null;
  imagen: string | null;   // nombre o URL
  duracion: number | null; // minutos
  estado: boolean | null;  // activo (vigente si además está en ventana)
}
