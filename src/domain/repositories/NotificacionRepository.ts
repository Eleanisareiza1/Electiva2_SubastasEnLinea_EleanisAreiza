import { Notificacion } from "../Notificacion";

// Puerto de persistencia de las notificaciones de cada usuario.
export interface NotificacionRepository {

    guardar(notificacion: Notificacion): Promise<void>;

    buscarPorId(id: string): Promise<Notificacion | null>;

    buscarPorUsuario(usuarioId: string, limite: number): Promise<Notificacion[]>;

}
