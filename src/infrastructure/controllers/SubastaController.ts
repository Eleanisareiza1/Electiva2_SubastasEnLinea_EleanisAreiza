//Estamos creando un controlador que se encarga de recibir las peticiones del cliente y devolver las respuestas. El controlador delega la creación de subastas a un caso de uso(application). 
//RNF-03 el controlador recibe datos, llama un caso de uso, responde pero NO toma decisiones de negocio

import { ConsultarSubastas } from "../../application/ConsultarSubasta";
import { subastaRepository } from "../repositories/repositories";
import { Request, Response } from "express";
import { CrearSubasta } from "../../application/CrearSubasta";
import { RegistrarPuja } from "../../application/RegistrarPuja";
import { CancelarSubasta } from "../../application/CancelarSubasta";
import { CerrarSubasta } from "../../application/CerrarSubasta";


export const crearSubasta = (
    request: Request,
    response: Response) => {

    try {
        const {
            vendedorId,
            titulo,
            precioBase,
            incrementoMinimo,
            fechaCierre
        } = request.body;

        const casoDeUso = new CrearSubasta(subastaRepository);

        const subasta = casoDeUso.ejecutar({
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

    } catch (error) {

        return response.status(400).json({
            ok: false,
            code: "SUBASTA_INVALIDA",
            message:
                error instanceof Error
                    ? error.message
                    : "Error desconocido"
        });

    }

};

export const obtenerSubastas = (
    request: Request,
    response: Response
) => {

    const casoDeUso =
        new ConsultarSubastas(subastaRepository);

    const subastas =
        casoDeUso.ejecutar();

    return response.status(200).json({
        ok: true,
        data: subastas
    });

};

export const registrarPuja = (
    request: Request,
    response: Response
) => {

    try {

        const { indice } =
            request.params;

        const {
            usuarioId,
            valor
        } = request.body;

        const casoDeUso =
            new RegistrarPuja(
                subastaRepository
            );

        casoDeUso.ejecutar({

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

        return response.status(400).json({
            ok: false,
            code: "PUJA_INVALIDA",
            message:
                error instanceof Error
                    ? error.message
                    : "Error desconocido"
        });

    }

};

export const cancelarSubasta = (
    request: Request,
    response: Response
) => {

    try {

        const { indice } =
            request.params;

        const casoDeUso =
            new CancelarSubasta(
                subastaRepository
            );

        casoDeUso.ejecutar({
            indiceSubasta:
                Number(indice)
        });

        return response.status(200).json({
            ok: true,
            message:
                "Subasta cancelada correctamente"
        });

    } catch (error) {

        return response.status(400).json({
            ok: false,
            code: "SUBASTA_INVALIDA",
            message:
                error instanceof Error
                    ? error.message
                    : "Error desconocido"
        });

    }

};

export const cerrarSubasta = (
    request: Request,
    response: Response
) => {

    try {

        const { indice } =
            request.params;

        const casoDeUso =
            new CerrarSubasta(
                subastaRepository
            );

        casoDeUso.ejecutar({
            indiceSubasta:
                Number(indice)
        });

        return response.status(200).json({
            ok: true,
            message:
                "Subasta cerrada correctamente"
        });

    } catch (error) {

        return response.status(400).json({
            ok: false,
            code: "SUBASTA_INVALIDA",
            message:
                error instanceof Error
                    ? error.message
                    : "Error desconocido"
        });

    }

};