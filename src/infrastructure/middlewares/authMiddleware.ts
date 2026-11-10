import {
    Request,
    Response,
    NextFunction
} from "express";

import {
    verificarToken
} from "../auth/jwt";

export interface AuthRequest
extends Request {

    usuario?: {
        correo: string;
    };

}

export function authMiddleware(
    request: AuthRequest,
    response: Response,
    next: NextFunction
) {

    const authHeader =
        request.headers.authorization;

    if (!authHeader) {

        return response.status(401).json({
            ok: false,
            code: "UNAUTHORIZED",
            message:
                "Token requerido"
        });

    }

    const token =
        authHeader.replace(
            "Bearer ",
            ""
        );

    try {

        const payload =
            verificarToken(token) as {
                correo: string;
            };

        request.usuario = {
            correo:
                payload.correo
        };

        next();

    } catch {

        return response.status(401).json({
            ok: false,
            code: "INVALID_TOKEN",
            message:
                "Token inválido"
        });

    }

}