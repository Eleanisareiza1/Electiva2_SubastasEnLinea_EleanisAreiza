import { NextFunction, Request, Response } from "express";
import { ErrorDominio, TipoErrorDominio } from "../../../domain/errors/ErrorDominio";
import { ErrorFormato } from "../validaciones";

// RNF-12: cada tipo de error se responde con el código HTTP que le corresponde.
const ESTADO_HTTP: Record<TipoErrorDominio, number> = {
    VALIDACION: 400,
    NO_AUTENTICADO: 401,
    PROHIBIDO: 403,
    NO_ENCONTRADO: 404,
    CONFLICTO: 409,
    REGLA_NEGOCIO: 422
};

// RNF-13: formato uniforme { ok: false, error: { codigo, mensaje, detalles? } }.
export function manejarErrores(
    error: unknown,
    request: Request,
    response: Response,
    _next: NextFunction
): void {

    if (error instanceof ErrorDominio) {
        response.status(ESTADO_HTTP[error.tipo]).json({
            ok: false,
            error: { codigo: error.codigo, mensaje: error.message }
        });
        return;
    }

    if (error instanceof ErrorFormato) {
        response.status(400).json({
            ok: false,
            error: { codigo: "FORMATO_INVALIDO", mensaje: error.message, detalles: error.detalles }
        });
        return;
    }

    if (error instanceof SyntaxError && "body" in error) {
        response.status(400).json({
            ok: false,
            error: { codigo: "JSON_INVALIDO", mensaje: "El cuerpo de la solicitud no es un JSON válido" }
        });
        return;
    }

    // RNF-17: los errores no controlados se registran en consola.
    console.error(`[error] ${request.method} ${request.originalUrl}`, error);

    response.status(500).json({
        ok: false,
        error: { codigo: "ERROR_INTERNO", mensaje: "Ocurrió un error inesperado en el servidor" }
    });
}

export function rutaNoEncontrada(request: Request, response: Response): void {
    response.status(404).json({
        ok: false,
        error: { codigo: "RUTA_NO_ENCONTRADA", mensaje: `No existe ${request.method} ${request.path}` }
    });
}
