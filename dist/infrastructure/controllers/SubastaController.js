"use strict";
//Estamos creando un controlador que se encarga de recibir las peticiones del cliente y devolver las respuestas. El controlador delega la creación de subastas a un caso de uso(application/CrearSubasta). 
//RNF-03 el controlador recibe datos, llama un caso de uso, responde pero NO toma decisiones de negocio
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerSubastas = exports.crearSubasta = void 0;
const ConsultarSubasta_1 = require("../../application/ConsultarSubasta");
const repositories_1 = require("../repositories/repositories");
const CrearSubasta_1 = require("../../application/CrearSubasta");
const crearSubasta = (request, response) => {
    try {
        const { titulo, precioBase, incrementoMinimo, fechaCierre } = request.body;
        const casoDeUso = new CrearSubasta_1.CrearSubasta(repositories_1.subastaRepository);
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
    }
    catch (error) {
        return response.status(400).json({
            ok: false,
            code: "SUBASTA_INVALIDA",
            message: error instanceof Error
                ? error.message
                : "Error desconocido"
        });
    }
};
exports.crearSubasta = crearSubasta;
const obtenerSubastas = (request, response) => {
    const casoDeUso = new ConsultarSubasta_1.ConsultarSubastas(repositories_1.subastaRepository);
    const subastas = casoDeUso.ejecutar();
    return response.status(200).json({
        ok: true,
        data: subastas
    });
};
exports.obtenerSubastas = obtenerSubastas;
//# sourceMappingURL=SubastaController.js.map