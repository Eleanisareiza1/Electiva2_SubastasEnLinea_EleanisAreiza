import { Server as ServidorHttp } from "http";
import { Server, Socket } from "socket.io";
import { JwtGeneradorTokens } from "../auth/JwtGeneradorTokens";

export const salaSubasta = (subastaId: string): string => `subasta:${subastaId}`;
export const salaUsuario = (usuarioId: string): string => `usuario:${usuarioId}`;
export const SALA_LISTADO = "listado";

interface DatosSocket {
    usuarioId: string;
}

// API de WebSockets: el servidor informa al cliente sin que este pregunte.
// Exige el token de sesión al conectarse y une al cliente a su sala personal.
export function crearServidorTiempoReal(
    servidorHttp: ServidorHttp,
    tokens: JwtGeneradorTokens,
    origenes: string[]
): Server {

    const io = new Server(servidorHttp, { cors: { origin: origenes } });

    io.use((socket, next) => {
        const token: unknown = socket.handshake.auth?.token;
        try {
            if (typeof token !== "string") {
                throw new Error("Token requerido");
            }
            const sesion = tokens.verificar(token);
            (socket.data as DatosSocket).usuarioId = sesion.usuarioId;
            next();
        } catch {
            next(new Error("NO_AUTENTICADO"));
        }
    });

    // RF-16 (opcional): cantidad de usuarios distintos conectados a una subasta.
    async function difundirParticipantes(subastaId: string): Promise<void> {
        const sockets = await io.in(salaSubasta(subastaId)).fetchSockets();
        const usuarios = new Set(sockets.map((s) => (s.data as DatosSocket).usuarioId));
        io.to(salaSubasta(subastaId)).emit("participantes", { subastaId, cantidad: usuarios.size });
    }

    io.on("connection", (socket: Socket) => {

        const { usuarioId } = socket.data as DatosSocket;
        void socket.join(salaUsuario(usuarioId));
        console.log(`[tiempo-real] Cliente conectado ${socket.id} (usuario ${usuarioId})`);

        // RF-12: suscripción a las novedades de una subasta específica.
        socket.on("suscribirse-subasta", async (subastaId: unknown) => {
            if (typeof subastaId !== "string" || !subastaId) {
                return;
            }
            await socket.join(salaSubasta(subastaId));
            await difundirParticipantes(subastaId);
        });

        socket.on("desuscribirse-subasta", async (subastaId: unknown) => {
            if (typeof subastaId !== "string") {
                return;
            }
            await socket.leave(salaSubasta(subastaId));
            await difundirParticipantes(subastaId);
        });

        socket.on("suscribirse-listado", () => void socket.join(SALA_LISTADO));
        socket.on("desuscribirse-listado", () => void socket.leave(SALA_LISTADO));

        socket.on("disconnecting", () => {
            const subastas = [...socket.rooms]
                .filter((sala) => sala.startsWith("subasta:"))
                .map((sala) => sala.slice("subasta:".length));
            setImmediate(() => subastas.forEach((id) => void difundirParticipantes(id)));
        });
    });

    return io;
}
