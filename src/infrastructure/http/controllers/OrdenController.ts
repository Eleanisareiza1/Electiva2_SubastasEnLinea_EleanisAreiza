import { Request, Response } from "express";
import { CasosDeUso } from "../../contenedor";
import { obtenerSesion } from "../middlewares/autenticacion";

export function crearOrdenController(casos: CasosDeUso) {
    return {

        async misOrdenes(_request: Request, response: Response): Promise<void> {
            const sesion = obtenerSesion(response);
            response.status(200).json({ ok: true, data: await casos.consultarOrdenes.ejecutar(sesion.usuarioId) });
        }

    };
}
