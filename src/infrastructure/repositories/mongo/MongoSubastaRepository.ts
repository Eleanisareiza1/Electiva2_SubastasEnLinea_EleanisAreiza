import { QueryFilter } from "mongoose";
import { Articulo } from "../../../domain/Articulo";
import { IntentoPujaFallida } from "../../../domain/IntentoPujaFallida";
import { OrdenPago } from "../../../domain/OrdenPago";
import { Puja } from "../../../domain/Puja";
import { Subasta } from "../../../domain/Subasta";
import {
    FiltrosSubasta,
    PaginaSubastas,
    SubastaRepository
} from "../../../domain/repositories/SubastaRepository";
import { Dinero } from "../../../domain/valueObjects/Dinero";
import { aEstadoConservacion } from "../../../domain/valueObjects/EstadoConservacion";
import { EstadoPago, aEstadoPago } from "../../../domain/valueObjects/EstadoPago";
import { EstadoSubasta, aEstadoSubasta } from "../../../domain/valueObjects/EstadoSubasta";
import { SubastaDoc, SubastaModelo } from "./modelos";

function escaparRegex(texto: string): string {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Traduce la entidad a documento.
function aDocumento(subasta: Subasta): SubastaDoc {

    const orden = subasta.obtenerOrdenPago();

    return {
        _id: subasta.id,
        vendedorId: subasta.vendedorId,
        articulo: {
            id: subasta.articulo.id,
            nombre: subasta.articulo.nombre,
            descripcion: subasta.articulo.descripcion,
            estadoConservacion: subasta.articulo.estadoConservacion,
            categoriaId: subasta.articulo.categoriaId,
            imagenUrl: subasta.articulo.imagenUrl
        },
        precioBase: subasta.precioBase.obtenerValor(),
        incrementoMinimo: subasta.incrementoMinimo.obtenerValor(),
        fechaPublicacion: subasta.fechaPublicacion,
        fechaCierre: subasta.fechaCierre,
        estado: subasta.obtenerEstado(),
        pujas: subasta.obtenerPujas().map((p) => ({
            postorId: p.postorId,
            valor: p.valor.obtenerValor(),
            fecha: p.fecha
        })),
        participantes: subasta.obtenerParticipantesIds(),
        intentosFallidos: subasta.obtenerIntentosFallidos().map((i) => ({
            postorId: i.postorId,
            valorOfrecido: i.valorOfrecido,
            codigoRegla: i.codigoRegla,
            motivo: i.motivo,
            fecha: i.fecha
        })),
        ganadorId: subasta.obtenerGanadorId(),
        ordenPago: orden
            ? {
                id: orden.id,
                ganadorId: orden.ganadorId,
                valor: orden.valor.obtenerValor(),
                fechaEmision: orden.fechaEmision,
                fechaLimite: orden.fechaLimite,
                estado: orden.obtenerEstado(),
                fechaPago: orden.obtenerFechaPago()
            }
            : null
    };
}

// Reconstruye la entidad y sus objetos de valor desde el documento.
function aEntidad(doc: SubastaDoc): Subasta {

    return Subasta.reconstruir({
        id: doc._id,
        vendedorId: doc.vendedorId,
        articulo: Articulo.reconstruir({
            id: doc.articulo.id,
            nombre: doc.articulo.nombre,
            descripcion: doc.articulo.descripcion,
            estadoConservacion: aEstadoConservacion(doc.articulo.estadoConservacion),
            categoriaId: doc.articulo.categoriaId,
            imagenUrl: doc.articulo.imagenUrl ?? null
        }),
        precioBase: new Dinero(doc.precioBase),
        incrementoMinimo: new Dinero(doc.incrementoMinimo),
        fechaPublicacion: new Date(doc.fechaPublicacion),
        fechaCierre: new Date(doc.fechaCierre),
        estado: aEstadoSubasta(doc.estado),
        pujas: (doc.pujas ?? []).map(
            (p) => new Puja(p.postorId, new Dinero(p.valor), new Date(p.fecha))
        ),
        intentosFallidos: (doc.intentosFallidos ?? []).map(
            (i) => new IntentoPujaFallida(i.postorId, i.valorOfrecido, i.codigoRegla, i.motivo, new Date(i.fecha))
        ),
        ganadorId: doc.ganadorId ?? null,
        ordenPago: doc.ordenPago
            ? OrdenPago.reconstruir({
                id: doc.ordenPago.id,
                subastaId: doc._id,
                ganadorId: doc.ordenPago.ganadorId,
                valor: new Dinero(doc.ordenPago.valor),
                fechaEmision: new Date(doc.ordenPago.fechaEmision),
                fechaLimite: new Date(doc.ordenPago.fechaLimite),
                estado: aEstadoPago(doc.ordenPago.estado),
                fechaPago: doc.ordenPago.fechaPago ? new Date(doc.ordenPago.fechaPago) : null
            })
            : null
    });
}

// Adaptador del puerto SubastaRepository sobre MongoDB.
export class MongoSubastaRepository implements SubastaRepository {

    async guardar(subasta: Subasta): Promise<void> {
        const documento = aDocumento(subasta);
        await SubastaModelo.replaceOne({ _id: documento._id }, documento, { upsert: true });
    }

    async buscarPorId(id: string): Promise<Subasta | null> {
        const doc = await SubastaModelo.findById(id).lean<SubastaDoc>();
        return doc ? aEntidad(doc) : null;
    }

    async buscarPorOrdenPagoId(ordenId: string): Promise<Subasta | null> {
        const doc = await SubastaModelo.findOne({ "ordenPago.id": ordenId }).lean<SubastaDoc>();
        return doc ? aEntidad(doc) : null;
    }

    async buscar(filtros: FiltrosSubasta): Promise<PaginaSubastas> {

        const consulta: QueryFilter<SubastaDoc> = {};

        if (filtros.categoriaId) {
            consulta["articulo.categoriaId"] = filtros.categoriaId;
        }
        if (filtros.estado) {
            consulta.estado = filtros.estado;
        }
        if (filtros.texto) {
            const patron = new RegExp(escaparRegex(filtros.texto), "i");
            consulta.$or = [{ "articulo.nombre": patron }, { "articulo.descripcion": patron }];
        }

        const orden: Record<string, 1 | -1> =
            filtros.estado === EstadoSubasta.ABIERTA ? { fechaCierre: 1 } : { fechaPublicacion: -1 };

        const [docs, total] = await Promise.all([
            SubastaModelo.find(consulta)
                .sort(orden)
                .skip((filtros.pagina - 1) * filtros.tamanoPagina)
                .limit(filtros.tamanoPagina)
                .lean<SubastaDoc[]>(),
            SubastaModelo.countDocuments(consulta)
        ]);

        return { items: docs.map(aEntidad), total };
    }

    async contarPorEstado(categoriaId?: string): Promise<Record<string, number>> {

        const coincidencia = categoriaId ? { "articulo.categoriaId": categoriaId } : {};

        const grupos = await SubastaModelo.aggregate<{ _id: string; total: number }>([
            { $match: coincidencia },
            { $group: { _id: "$estado", total: { $sum: 1 } } }
        ]);

        return Object.fromEntries(grupos.map((g) => [g._id, g.total]));
    }

    async buscarPendientesDeSincronizar(ahora: Date): Promise<Subasta[]> {
        const docs = await SubastaModelo.find({
            $or: [
                { estado: EstadoSubasta.ABIERTA, fechaCierre: { $lte: ahora } },
                {
                    estado: EstadoSubasta.CERRADA,
                    "ordenPago.estado": EstadoPago.PENDIENTE,
                    "ordenPago.fechaLimite": { $lt: ahora }
                }
            ]
        }).lean<SubastaDoc[]>();
        return docs.map(aEntidad);
    }

    async buscarPorVendedor(vendedorId: string): Promise<Subasta[]> {
        const docs = await SubastaModelo.find({ vendedorId }).sort({ fechaPublicacion: -1 }).lean<SubastaDoc[]>();
        return docs.map(aEntidad);
    }

    async buscarPorParticipante(postorId: string): Promise<Subasta[]> {
        const docs = await SubastaModelo.find({ participantes: postorId })
            .sort({ fechaPublicacion: -1 })
            .lean<SubastaDoc[]>();
        return docs.map(aEntidad);
    }

    async buscarPorGanador(ganadorId: string): Promise<Subasta[]> {
        const docs = await SubastaModelo.find({ ganadorId }).lean<SubastaDoc[]>();
        return docs.map(aEntidad);
    }

}
