import { Server } from "socket.io"; // biblioteca de JavaScript que permite la comunicación bidireccional en tiempo real entre un servidor y clientes.
import { NotificacionPort } from "../../application/ports/NotificacionPort";

export class SocketIONotificacionAdapter
    implements NotificacionPort {

    constructor(
        private readonly io: Server
    ) {}

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

}