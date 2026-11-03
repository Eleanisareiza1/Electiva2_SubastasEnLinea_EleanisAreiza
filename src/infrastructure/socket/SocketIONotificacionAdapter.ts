import { Server } from "socket.io"; // biblioteca de JavaScript que permite la comunicación bidireccional en tiempo real entre un servidor y clientes.
import { NotificacionPort } from "../../application/ports/NotificacionPort";

// Implementa el puerto de notificaciones de aplicación usando salas de Socket.IO.
export class SocketIONotificacionAdapter
    implements NotificacionPort {

    constructor(
        private readonly io: Server
    ) {}

    // Emite el importe de una nueva puja a los clientes de la sala correspondiente.
    notificarNuevaPuja(
        indiceSubasta: number,
        valor: number
    ): void {
    
    console.log(
        "Emitiendo nueva-puja",{
            indiceSubasta,
            valor }
        );

        this.io.to(
            `subasta-${indiceSubasta}`
        ).emit(
            "nueva-puja",
            {
                indiceSubasta,
                valor
            }
        );

    }

    // Avisa al usuario indicado que otra oferta ha tomado el liderazgo.
    notificarUsuarioSuperado(
    indiceSubasta: number,
    usuarioId: string
    ): void {
        console.log(
            "⚠️ Emitiendo usuario-superado",
            usuarioId
        );
        this.io.to(
            `subasta-${indiceSubasta}`
        ).emit(
            "usuario-superado",
            {
                usuarioId
            }
        );

    }

    // Comunica el cierre a todos los clientes suscritos a la subasta.
    notificarSubastaCerrada(
        indiceSubasta: number
    ): void {

    console.log(
        " Emitiendo subasta-cerrada",
        indiceSubasta
    );

    this.io.to(
        `subasta-${indiceSubasta}`
    ).emit(
        "subasta-cerrada",
        {
            indiceSubasta
        }
    );

    }

}