import { NextFunction, Request, Response } from "express";
import { DatosSesion } from "../../../application/ports/GeneradorTokens";
import { ErrorDominio } from "../../../domain/errors/ErrorDominio";
import { JwtGeneradorTokens } from "../../auth/JwtGeneradorTokens";

const CLAVE_SESION = "sesion";

// Verifica el token Bearer y deja la sesión disponible para el controlador.
export function crearMiddlewareAutenticacion(tokens: JwtGeneradorTokens) {

    return (request: Request, response: Response, next: NextFunction): void => {

        const cabecera = request.headers.authorization ?? "";
        const [tipo, token] = cabecera.split(" ");

        if (tipo !== "Bearer" || !token) {
            next(new ErrorDominio("TOKEN_REQUERIDO", "Debe iniciar sesión para continuar", "NO_AUTENTICADO"));
            return;
        }

        try {
            response.locals[CLAVE_SESION] = tokens.verificar(token);
            next();
        } catch {
            next(new ErrorDominio("TOKEN_INVALIDO", "La sesión expiró o no es válida; inicie sesión de nuevo", "NO_AUTENTICADO"));
        }
    };
}

export function obtenerSesion(response: Response): DatosSesion {
    const sesion: unknown = response.locals[CLAVE_SESION];
    if (!sesion || typeof sesion !== "object") {
        throw new ErrorDominio("TOKEN_REQUERIDO", "Debe iniciar sesión para continuar", "NO_AUTENTICADO");
    }
    return sesion as DatosSesion;
}
