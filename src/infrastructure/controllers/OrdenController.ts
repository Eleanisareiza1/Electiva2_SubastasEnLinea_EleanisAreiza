import { Response, NextFunction} from "express"
import { AuthRequest } from "../middlewares/authMiddleware";
import { ConsultarOrdenesPago} from "../../application/ConsultarOrdenesPago";
import {subastaRepository} from "../repositories/repositories";

export const obtenerOrdenes = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
) => {

    try {

        const casoDeUso =
            new ConsultarOrdenesPago(
                subastaRepository
            );

        const resultado =
            await casoDeUso.ejecutar(
                request.usuario!.correo
            );

        return response.status(200).json({
            ok: true,
            data: resultado
        });

    } catch (error) {

        next(error);

    }

};