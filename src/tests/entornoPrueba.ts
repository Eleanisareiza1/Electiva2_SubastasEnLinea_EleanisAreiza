// Arma la aplicación completa con persistencia en memoria y un puerto de
// tiempo real que solo registra lo que se difundiría.
import { Application } from "express";
import {
    CambioEstadoDifundido,
    NotificacionPersonal,
    NotificacionPort,
    NuevaPujaDifundida
} from "../application/ports/NotificacionPort";
import { crearApp } from "../app";
import { BcryptCifrador } from "../infrastructure/auth/BcryptCifrador";
import { JwtGeneradorTokens } from "../infrastructure/auth/JwtGeneradorTokens";
import { UuidGeneradorIds } from "../infrastructure/auth/UuidGeneradorIds";
import { CasosDeUso, Repositorios, crearCasosDeUso, crearRepositorios } from "../infrastructure/contenedor";

export class TiempoRealEspia implements NotificacionPort {
    pujas: NuevaPujaDifundida[] = [];
    estados: CambioEstadoDifundido[] = [];
    personales: Array<{ usuarioId: string; notificacion: NotificacionPersonal }> = [];

    difundirNuevaPuja(datos: NuevaPujaDifundida): void { this.pujas.push(datos); }
    difundirCambioEstado(datos: CambioEstadoDifundido): void { this.estados.push(datos); }
    enviarAUsuario(usuarioId: string, notificacion: NotificacionPersonal): void {
        this.personales.push({ usuarioId, notificacion });
    }
}

export const SECRETO_WEBHOOK = "secreto-de-prueba";

export interface EntornoPrueba {
    app: Application;
    casos: CasosDeUso;
    repos: Repositorios;
    espia: TiempoRealEspia;
}

export async function crearEntornoPrueba(): Promise<EntornoPrueba> {
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);

    const repos = await crearRepositorios("memoria");
    const espia = new TiempoRealEspia();
    const tokens = new JwtGeneradorTokens("jwt-de-prueba", "1h");
    const casos = crearCasosDeUso(repos, {
        tiempoReal: espia,
        cifrador: new BcryptCifrador(),
        tokens,
        ids: new UuidGeneradorIds()
    });
    const app = crearApp(casos, tokens, { webhookSecret: SECRETO_WEBHOOK, origenesPermitidos: ["*"] });
    return { app, casos, repos, espia };
}
