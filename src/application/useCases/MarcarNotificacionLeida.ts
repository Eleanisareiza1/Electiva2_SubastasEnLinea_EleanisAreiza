import { ErrorDominio } from "../../domain/errors/ErrorDominio";
import { NotificacionRepository } from "../../domain/repositories/NotificacionRepository";

export class MarcarNotificacionLeida {

    constructor(private readonly notificaciones: NotificacionRepository) {}

    async ejecutar(notificacionId: string, usuarioId: string): Promise<void> {

        const notificacion = await this.notificaciones.buscarPorId(notificacionId);

        if (!notificacion) {
            throw new ErrorDominio(
                "NOTIFICACION_NO_ENCONTRADA",
                "La notificación no existe",
                "NO_ENCONTRADO"
            );
        }

        notificacion.marcarLeida(usuarioId);

        await this.notificaciones.guardar(notificacion);
    }

}
