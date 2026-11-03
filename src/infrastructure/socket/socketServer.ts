import { Server } from "socket.io";

// Mantiene la instancia de Socket.IO para reutilizarla al enviar notificaciones.
let io: Server;

// Inicializa Socket.IO en el servidor HTTP y permite a los clientes unirse a salas.
export function configurarSocket(
    servidor: any
): Server {

    io = new Server(
        servidor,
        {
            cors: {
                origin: "*"
            }
        }
    );

    io.on(
        "connection",
        (socket) => {

            console.log(
                "Cliente conectado:",
                socket.id
            );

            socket.on(
                "suscribirse-subasta",
                (
                    indiceSubasta: number
                ) => {

                    socket.join(
                        `subasta-${indiceSubasta}`
                    );

                    console.log(
                        `✅ Cliente ${socket.id} suscrito a subasta-${indiceSubasta}`
                    );

                }
            );

        }
    );

    return io;

}

export function obtenerSocket(): Server {

    // Proporciona la instancia configurada a controladores y adaptadores de notificación.
    return io;

}