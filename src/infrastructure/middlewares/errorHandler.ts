import { Request,   Response,   NextFunction} from "express";

// Registra los errores recibidos por Express y responde con el formato común de la API.
export function errorHandler(
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction
) {

    console.error(error);

    return response.status(400).json({
        ok: false,
        code: "ERROR_DE_NORMAS_DE_NEGOCIO",
        message: error.message
    });

}