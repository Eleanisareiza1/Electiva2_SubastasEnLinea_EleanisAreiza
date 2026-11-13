// Puerto de salida para difundir hechos del negocio en tiempo real (RNF-05).
// Los casos de uso solo conocen esta interfaz; el adaptador de Socket.IO
// la traduce a mensajes de WebSocket.

export interface NuevaPujaDifundida {
    subastaId: string;
    valor: number;
    postorId: string;
    postorNombre: string;
    fecha: string;
    totalPujas: number;
    montoMinimoSiguiente: number;
}

export interface CambioEstadoDifundido {
    subastaId: string;
    estado: string;
    titulo: string;
    ganadorId: string | null;
    ganadorNombre: string | null;
    valorFinal: number | null;
    mensaje: string;
}

export interface NotificacionPersonal {
    id: string;
    tipo: string;
    mensaje: string;
    subastaId: string | null;
    fecha: string;
    leida: boolean;
}

export interface NotificacionPort {

    // RF-13: nueva puja aceptada para todos los suscritos a la subasta.
    difundirNuevaPuja(datos: NuevaPujaDifundida): void;

    // RF-15: cierre, adjudicación, cancelación o pago de una subasta.
    difundirCambioEstado(datos: CambioEstadoDifundido): void;

    // RF-14 y avisos personales: solo para el usuario indicado.
    enviarAUsuario(usuarioId: string, notificacion: NotificacionPersonal): void;

}
