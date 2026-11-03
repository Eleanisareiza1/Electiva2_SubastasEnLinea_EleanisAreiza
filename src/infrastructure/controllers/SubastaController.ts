// Adapta las solicitudes HTTP de subastas a los casos de uso y devuelve sus resultados.
// Mantiene las reglas de negocio en la capa de aplicación y en las entidades de dominio.

import { ConsultarSubastas } from "../../application/ConsultarSubasta";
import { subastaRepository } from "../repositories/repositories";
import { Request, Response, NextFunction } from "express";
import { CrearSubasta } from "../../application/CrearSubasta";
import { RegistrarPuja } from "../../application/RegistrarPuja";
import { CancelarSubasta } from "../../application/CancelarSubasta";
import { CerrarSubasta } from "../../application/CerrarSubasta";
import { SocketIONotificacionAdapter }from "../socket/SocketIONotificacionAdapter";
import { obtenerSocket } from "../socket/socketServer";

export const crearSubasta = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {

    // Traduce los datos recibidos en el cuerpo de la solicitud y delega la creación.
    try {
        const {
            vendedorId,
            titulo,
            precioBase,
            incrementoMinimo,
            fechaCierre
        } = request.body;

        const casoDeUso = new CrearSubasta(subastaRepository);

        const subasta = await casoDeUso.ejecutar({
            vendedorId,
            titulo,
            precioBase,
            incrementoMinimo,
            fechaCierre: new Date(fechaCierre)
        });

        return response.status(201).json({
            ok: true,
            data: subasta
        });

    } catch (error) {next(error);
        
     }

};

export const obtenerSubastas = async (
    request: Request,
    response: Response
) => {

    // Consulta todas las subastas mediante el caso de uso correspondiente.
    const casoDeUso =
        new ConsultarSubastas(subastaRepository);

    const subastas =
        await casoDeUso.ejecutar();

    return response.status(200).json({
        ok: true,
        data: subastas
    });

};

export const registrarPuja = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {


    try {

        // Obtiene el índice de la ruta y los datos de la puja enviada por el cliente.
        const { indice } =
            request.params;

        const {
            usuarioId,
            valor
        } = request.body;

        const notificaciones =
            new SocketIONotificacionAdapter(
                obtenerSocket()
            );

        // Registra la puja; el caso de uso persiste el cambio y emite notificaciones.
        const casoDeUso =
            new RegistrarPuja(
                subastaRepository,
                notificaciones
            );

        await casoDeUso.ejecutar({

            indiceSubasta:
                Number(indice),

            usuarioId,
            valor

        });

        return response.status(201).json({
            ok: true,
            message:
                "Puja registrada correctamente"
        });

    } catch (error) {

        next(error);}

};

export const cancelarSubasta = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {

    try {

        // Delega la cancelación usando el índice especificado en la ruta.
        const { indice } =
            request.params;

        const casoDeUso =
            new CancelarSubasta(
                subastaRepository
            );

        await casoDeUso.ejecutar({
            indiceSubasta:
                Number(indice)
        });

        return response.status(200).json({
            ok: true,
            message:
                "Subasta cancelada correctamente"
        });

    } catch (error) {next(error);}

};

export const cerrarSubasta = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {

    try {

        // Delega el cierre y prepara el adaptador para notificar a los clientes conectados.
        const { indice } =
            request.params;

        const notificaciones =
            new SocketIONotificacionAdapter(
                obtenerSocket()
            );

        const casoDeUso =
            new CerrarSubasta(
                subastaRepository,
                notificaciones
            );

        await casoDeUso.ejecutar({
            indiceSubasta:
                Number(indice)
        });

        return response.status(200).json({
            ok: true,
            message:
                "Subasta cerrada correctamente"
        });

    } catch (error) {

        next(error);

    }

};
