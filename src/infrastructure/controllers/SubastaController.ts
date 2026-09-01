//Estamos creando un controlador que se encarga de recibir las peticiones del cliente y devolver las respuestas. El controlador delega la creación de subastas a un caso de uso(application/CrearSubasta). 
//RNF-03 el controlador recibe datos, llama un caso de uso, responde pero NO toma decisiones de negocio

import { ConsultarSubastas } from "../../application/consultarSubasta";
import { subastaRepository } from "../repositories/repositories";
import { Request, Response } from "express";
import { CrearSubasta } from "./../../application/CrearSubasta";

export const crearSubasta = (
    request: Request,
    response: Response) => {

    try {
        const {
            titulo,
            precioBase,
            incrementoMinimo,
            fechaCierre
        } = request.body;

        const casoDeUso = new CrearSubasta(subastaRepository);

        const subasta = casoDeUso.ejecutar({
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