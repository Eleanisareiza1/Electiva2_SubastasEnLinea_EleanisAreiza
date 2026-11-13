// Contratos de datos que devuelve la API (ver docs/openapi.yaml).

export type EstadoSubasta = 'ABIERTA' | 'CANCELADA' | 'DESIERTA' | 'CERRADA' | 'PAGADA' | 'INCUMPLIDA';
export type EstadoPago = 'PENDIENTE' | 'PAGADA' | 'VENCIDA';

export interface RespuestaApi<T> {
  ok: true;
  data: T;
}

export interface ErrorApi {
  ok: false;
  error: { codigo: string; mensaje: string; detalles?: string[] };
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  fechaRegistro: string;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface SubastaResumen {
  id: string;
  titulo: string;
  imagenUrl: string | null;
  categoriaId: string;
  categoriaNombre: string;
  estadoConservacion: string;
  estado: EstadoSubasta;
  precioBase: number;
  incrementoMinimo: number;
  ofertaVigente: number | null;
  montoMinimoSiguiente: number;
  totalPujas: number;
  fechaPublicacion: string;
  fechaCierre: string;
  vendedorId: string;
  vendedorNombre: string;
  ganadorId: string | null;
  ganadorNombre: string | null;
}

export interface Puja {
  postorId: string;
  postorNombre: string;
  valor: number;
  fecha: string;
}

export interface OrdenPago {
  id: string;
  subastaId: string;
  titulo: string;
  valor: number;
  estado: EstadoPago;
  fechaEmision: string;
  fechaLimite: string;
  fechaPago: string | null;
}

export interface SubastaDetalle extends SubastaResumen {
  descripcion: string;
  historial: Puja[];
  totalParticipantes: number;
  mejorPostorId: string | null;
  ordenPago: OrdenPago | null;
}

export interface Listado {
  items: SubastaResumen[];
  pagina: number;
  tamanoPagina: number;
  total: number;
  totalPaginas: number;
  conteoPorEstado: Partial<Record<EstadoSubasta, number>>;
}

export interface Perfil {
  usuario: Usuario;
  publicadas: SubastaResumen[];
  participadas: SubastaResumen[];
  estadisticas: { publicadas: number; participando: number; ganadas: number; liderando: number };
}

export interface IntentoFallido {
  postorId: string;
  postorNombre: string;
  valorOfrecido: number;
  codigo: string;
  motivo: string;
  fecha: string;
}

export interface Notificacion {
  id: string;
  tipo: string;
  mensaje: string;
  subastaId: string | null;
  fecha: string;
  leida: boolean;
}

// Mensajes que llegan por WebSocket.
export interface EventoNuevaPuja {
  subastaId: string;
  valor: number;
  postorId: string;
  postorNombre: string;
  fecha: string;
  totalPujas: number;
  montoMinimoSiguiente: number;
}

export interface EventoCambioEstado {
  subastaId: string;
  estado: EstadoSubasta;
  titulo: string;
  ganadorId: string | null;
  ganadorNombre: string | null;
  valorFinal: number | null;
  mensaje: string;
}

export interface EventoParticipantes {
  subastaId: string;
  cantidad: number;
}

export const ESTADOS_SUBASTA: { valor: EstadoSubasta; etiqueta: string }[] = [
  { valor: 'ABIERTA', etiqueta: 'En vivo' },
  { valor: 'CERRADA', etiqueta: 'Adjudicadas' },
  { valor: 'PAGADA', etiqueta: 'Pagadas' },
  { valor: 'DESIERTA', etiqueta: 'Desiertas' },
  { valor: 'CANCELADA', etiqueta: 'Canceladas' },
  { valor: 'INCUMPLIDA', etiqueta: 'Incumplidas' }
];

export const ESTADOS_CONSERVACION: { valor: string; etiqueta: string }[] = [
  { valor: 'NUEVO', etiqueta: 'Nuevo' },
  { valor: 'COMO_NUEVO', etiqueta: 'Como nuevo' },
  { valor: 'BUEN_ESTADO', etiqueta: 'Buen estado' },
  { valor: 'USADO', etiqueta: 'Usado' },
  { valor: 'PARA_REPARAR', etiqueta: 'Para reparar' }
];
