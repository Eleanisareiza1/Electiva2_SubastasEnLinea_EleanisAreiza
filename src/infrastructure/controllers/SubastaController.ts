//Estamos creando un controlador que se encarga de recibir las peticiones del cliente y devolver las respuestas. El controlador delega la creación de subastas a un caso de uso(application). 
//RNF-03 el controlador recibe datos, llama un caso de uso, responde pero NO toma decisiones de negocio

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
