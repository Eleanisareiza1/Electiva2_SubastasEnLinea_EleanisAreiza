import { Server } from "socket.io";

let io: Server;

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

    return io;

}