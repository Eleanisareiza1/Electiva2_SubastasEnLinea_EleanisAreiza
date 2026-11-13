import { Request, Response } from "express";
import { CasosDeUso } from "../../contenedor";
import { obtenerSesion } from "../middlewares/autenticacion";

export function crearNotificacionController(casos: CasosDeUso) {
    return {

        async listar(_request: Request, response: Response): Promise<void> {
            const sesion = obtenerSesion(response);
            response.status(200).json({ ok: true, data: await casos.consultarNotificaciones.ejecutar(sesion.usuarioId) });
        },

        async marcarLeida(request: Request, response: Response): Promise<void> {
            const sesion = obtenerSesion(response);
            const id = typeof request.params.id === "string" ? request.params.id : "";
            await casos.marcarNotificacionLeida.ejecutar(id, sesion.usuarioId);
            response.status(204).send();
        }

    };
}
