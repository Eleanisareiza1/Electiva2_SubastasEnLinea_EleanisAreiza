import { Request, Response } from "express";
import { aEstadoSubasta } from "../../../domain/valueObjects/EstadoSubasta";
import { CasosDeUso } from "../../contenedor";
import { obtenerSesion } from "../middlewares/autenticacion";
import { LectorCuerpo, enteroPositivo } from "../validaciones";

function parametro(request: Request, nombre: string): string {
    const valor = request.params[nombre];
    return typeof valor === "string" ? valor : "";
}

function textoConsulta(request: Request, nombre: string): string | undefined {
    const valor = request.query[nombre];
    return typeof valor === "string" && valor.trim() ? valor.trim() : undefined;
}

export function crearSubastaController(casos: CasosDeUso) {
    return {

        async listarCategorias(_request: Request, response: Response): Promise<void> {
            response.status(200).json({ ok: true, data: await casos.listarCategorias.ejecutar() });
        },

        // GET /subastas?categoria=&estado=&texto=&pagina=&tamano=
        async listar(request: Request, response: Response): Promise<void> {
            const estado = textoConsulta(request, "estado");
            const listado = await casos.listarSubastas.ejecutar({
                categoriaId: textoConsulta(request, "categoria"),
                estado: estado ? aEstadoSubasta(estado.toUpperCase()) : undefined,
                texto: textoConsulta(request, "texto"),
                pagina: enteroPositivo(request.query.pagina, 1, 10_000),
                tamanoPagina: enteroPositivo(request.query.tamano, 12, 50)
            });
            response.status(200).json({ ok: true, data: listado });
        },

        async publicar(request: Request, response: Response): Promise<void> {
            const sesion = obtenerSesion(response);
            const cuerpo = new LectorCuerpo(request.body);
            const datos = {
                vendedorId: sesion.usuarioId,
                nombre: cuerpo.texto("nombre", { max: 120 }),
                descripcion: cuerpo.texto("descripcion", { max: 2000 }),
                estadoConservacion: cuerpo.texto("estadoConservacion"),
                categoriaId: cuerpo.texto("categoriaId"),
                imagenUrl: cuerpo.texto("imagenUrl", { opcional: true, max: 500 }) || null,
                precioBase: cuerpo.numero("precioBase"),
                incrementoMinimo: cuerpo.numero("incrementoMinimo"),
                fechaCierre: cuerpo.fecha("fechaCierre")
            };
            cuerpo.verificar();
            const subasta = await casos.publicarSubasta.ejecutar(datos);
            response.status(201).location(`/api/v1/subastas/${subasta.id}`).json({ ok: true, data: subasta });
        },

        async detalle(request: Request, response: Response): Promise<void> {
            const sesion = obtenerSesion(response);
            const detalle = await casos.consultarDetalle.ejecutar(parametro(request, "id"), sesion.usuarioId);
            response.status(200).json({ ok: true, data: detalle });
        },

        async historial(request: Request, response: Response): Promise<void> {
            const sesion = obtenerSesion(response);
            const detalle = await casos.consultarDetalle.ejecutar(parametro(request, "id"), sesion.usuarioId);
            response.status(200).json({ ok: true, data: detalle.historial });
        },

        async cancelar(request: Request, response: Response): Promise<void> {
            const sesion = obtenerSesion(response);
            await casos.cancelarSubasta.ejecutar(parametro(request, "id"), sesion.usuarioId);
            response.status(200).json({ ok: true, data: { mensaje: "Subasta cancelada" } });
        },

        async pujar(request: Request, response: Response): Promise<void> {
            const sesion = obtenerSesion(response);
            const cuerpo = new LectorCuerpo(request.body);
            const valor = cuerpo.numero("valor");
            cuerpo.verificar();
            const puja = await casos.registrarPuja.ejecutar({
                subastaId: parametro(request, "id"),
                postorId: sesion.usuarioId,
                valor
            });
            response.status(201).json({ ok: true, data: puja });
        },

        async intentosFallidos(request: Request, response: Response): Promise<void> {
            const sesion = obtenerSesion(response);
            const intentos = await casos.consultarIntentosFallidos.ejecutar(parametro(request, "id"), sesion.usuarioId);
            response.status(200).json({ ok: true, data: intentos });
        }

    };
}
