import { Request, Response, NextFunction} from "express";
import { EventoPago} from "../../domain/EventoPago";
import { ProcesarEventoPago} from "../../application/ProcesarEventoPago";

export const recibirPago = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    
    const secret =
        request.headers[
            "x-webhook-secret"
        ];

    if (
        secret !==
        process.env.WEBHOOK_SECRET
    ) {

        return response.status(401).json({

            ok: false,

            message:
                "Origen no autorizado"

        });

}

    try {

        const {
            eventoId,
            ordenId,
            estado
        } = request.body;

        const casoDeUso =
            new ProcesarEventoPago();

        await casoDeUso.ejecutar(

            new EventoPago(
                eventoId,
                ordenId,
                estado
            )

        );

        return response.status(200).json({
            ok: true,
            message:
                "Webhook recibido"
        });

    } catch (error) {

        next(error);

    }

};