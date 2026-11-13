import { Server } from "socket.io";
import {
    CambioEstadoDifundido,
    NotificacionPersonal,
    NotificacionPort,
    NuevaPujaDifundida
} from "../../application/ports/NotificacionPort";
import { SALA_LISTADO, salaSubasta, salaUsuario } from "./ServidorTiempoReal";

// Adaptador del puerto de salida: traduce los hechos del negocio a mensajes de
// Socket.IO y deja registro en consola (RNF-17).
export class SocketIONotificacionAdapter implements NotificacionPort {

    constructor(private readonly io: Server) {}

    difundirNuevaPuja(datos: NuevaPujaDifundida): void {
        console.log(`[tiempo-real] nueva-puja ${datos.subastaId}: $${datos.valor}`);
        this.io.to(salaSubasta(datos.subastaId)).to(SALA_LISTADO).emit("nueva-puja", datos);
    }

    difundirCambioEstado(datos: CambioEstadoDifundido): void {
        console.log(`[tiempo-real] subasta-estado ${datos.subastaId}: ${datos.estado}`);
        this.io.to(salaSubasta(datos.subastaId)).to(SALA_LISTADO).emit("subasta-estado", datos);
    }

    enviarAUsuario(usuarioId: string, notificacion: NotificacionPersonal): void {
        console.log(`[tiempo-real] notificacion ${notificacion.tipo} -> usuario ${usuarioId}`);
        this.io.to(salaUsuario(usuarioId)).emit("notificacion", notificacion);
    }

}
