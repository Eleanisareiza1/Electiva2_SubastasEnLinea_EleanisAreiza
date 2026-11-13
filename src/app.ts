import cors from "cors";
import express, { Application } from "express";
import { IncomingMessage } from "http";
import { JwtGeneradorTokens } from "./infrastructure/auth/JwtGeneradorTokens";
import { CasosDeUso } from "./infrastructure/contenedor";
import { SolicitudConCuerpoCrudo } from "./infrastructure/http/controllers/WebhookController";
import { manejarErrores, rutaNoEncontrada } from "./infrastructure/http/middlewares/manejoErrores";
import { crearRutas } from "./infrastructure/http/rutas";

// Configura Express: CORS, JSON (guardando el cuerpo crudo para el webhook),
// registro de solicitudes, rutas versionadas y manejo centralizado de errores.
export function crearApp(
    casos: CasosDeUso,
    tokens: JwtGeneradorTokens,
    opciones: { webhookSecret: string; origenesPermitidos: string[] }
): Application {

    const app = express();

    app.use(cors({ origin: opciones.origenesPermitidos }));

    app.use(express.json({
        limit: "100kb",
        verify: (request: IncomingMessage, _response, buffer: Buffer) => {
            (request as SolicitudConCuerpoCrudo).cuerpoCrudo = buffer;
        }
    }));

    app.use((request, response, next) => {
        const inicio = Date.now();
        response.on("finish", () => {
            console.log(`[http] ${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - inicio}ms`);
        });
        next();
    });

    app.use("/api/v1", crearRutas(casos, tokens, opciones.webhookSecret));
    app.use(rutaNoEncontrada);
    app.use(manejarErrores);

    return app;
}
