export interface PeriodoPrecipitacion { periodo: string; anioDesde: number; anioHasta: number; valores: number[]; publicado: boolean; }
export interface PrecipitacionData { carmenAcumuladaMm: number | null; carmenVisible: boolean; carmenFecha?: string | null; carmenHora?: string | null; periodos: PeriodoPrecipitacion[]; anioActual: number; valoresActuales: Array<number | null>; }
