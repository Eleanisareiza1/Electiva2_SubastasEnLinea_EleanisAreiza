import { NotificacionRepository } from "../../domain/repositories/NotificacionRepository";
import { NotificacionPersonal } from "../ports/NotificacionPort";

export class ConsultarNotificaciones {

    constructor(private readonly notificaciones: NotificacionRepository) {}

    async ejecutar(usuarioId: string): Promise<NotificacionPersonal[]> {

        const lista = await this.notificaciones.buscarPorUsuario(usuarioId, 50);

        return lista.map((n) => ({
            id: n.id,
            tipo: n.tipo,
            mensaje: n.mensaje,
            subastaId: n.subastaId,
            fecha: n.fecha.toISOString(),
            leida: n.estaLeida()
        }));
    }

}
