// Adaptadores MongoDB de usuarios, categorías, eventos de pago y notificaciones.

import { Categoria } from "../../../domain/Categoria";
import { EventoPago } from "../../../domain/EventoPago";
import { Notificacion } from "../../../domain/Notificacion";
import { Usuario } from "../../../domain/Usuario";
import { ErrorDominio } from "../../../domain/errors/ErrorDominio";
import { CategoriaRepository } from "../../../domain/repositories/CategoriaRepository";
import { EventoPagoRepository } from "../../../domain/repositories/EventoPagoRepository";
import { NotificacionRepository } from "../../../domain/repositories/NotificacionRepository";
import { UsuarioRepository } from "../../../domain/repositories/UsuarioRepository";
import { Correo } from "../../../domain/valueObjects/Correo";
import { aResultadoPago } from "../../../domain/valueObjects/ResultadoPago";
import { TipoNotificacion } from "../../../domain/valueObjects/TipoNotificacion";
import { CATEGORIAS_INICIALES } from "../categoriasIniciales";
import {
    CategoriaDoc,
    CategoriaModelo,
    EventoPagoDoc,
    EventoPagoModelo,
    NotificacionDoc,
    NotificacionModelo,
    UsuarioDoc,
    UsuarioModelo
} from "./modelos";

function esClaveDuplicada(error: unknown): boolean {
    return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

function aUsuario(doc: UsuarioDoc): Usuario {
    return Usuario.reconstruir({
        id: doc._id,
        nombre: doc.nombre,
        correo: doc.correo,
        passwordHash: doc.passwordHash,
        fechaRegistro: new Date(doc.fechaRegistro)
    });
}

export class MongoUsuarioRepository implements UsuarioRepository {

    async guardar(usuario: Usuario): Promise<void> {
        try {
            await UsuarioModelo.replaceOne(
                { _id: usuario.id },
                {
                    _id: usuario.id,
                    nombre: usuario.nombre,
                    correo: usuario.correo.obtenerValor(),
                    passwordHash: usuario.passwordHash,
                    fechaRegistro: usuario.fechaRegistro
                },
                { upsert: true }
            );
        } catch (error) {
            if (esClaveDuplicada(error)) {
                throw new ErrorDominio("RN-22", "Ya existe un usuario registrado con ese correo", "CONFLICTO");
            }
            throw error;
        }
    }

    async buscarPorId(id: string): Promise<Usuario | null> {
        const doc = await UsuarioModelo.findById(id).lean<UsuarioDoc>();
        return doc ? aUsuario(doc) : null;
    }

    async buscarPorCorreo(correo: Correo): Promise<Usuario | null> {
        const doc = await UsuarioModelo.findOne({ correo: correo.obtenerValor() }).lean<UsuarioDoc>();
        return doc ? aUsuario(doc) : null;
    }

    async buscarPorIds(ids: string[]): Promise<Usuario[]> {
        if (ids.length === 0) {
            return [];
        }
        const docs = await UsuarioModelo.find({ _id: { $in: ids } }).lean<UsuarioDoc[]>();
        return docs.map(aUsuario);
    }

}

export class MongoCategoriaRepository implements CategoriaRepository {

    // Inserta las categorías iniciales que falten (idempotente).
    async asegurarIniciales(): Promise<void> {
        await CategoriaModelo.bulkWrite(
            CATEGORIAS_INICIALES.map((c) => ({
                updateOne: {
                    filter: { _id: c.id },
                    update: { $setOnInsert: { _id: c.id, nombre: c.nombre, descripcion: c.descripcion } },
                    upsert: true
                }
            }))
        );
    }

    async obtenerTodas(): Promise<Categoria[]> {
        const docs = await CategoriaModelo.find().sort({ nombre: 1 }).lean<CategoriaDoc[]>();
        return docs.map((d) => new Categoria(d._id, d.nombre, d.descripcion));
    }

    async buscarPorId(id: string): Promise<Categoria | null> {
        const doc = await CategoriaModelo.findById(id).lean<CategoriaDoc>();
        return doc ? new Categoria(doc._id, doc.nombre, doc.descripcion) : null;
    }

}

export class MongoEventoPagoRepository implements EventoPagoRepository {

    async buscarPorId(eventoId: string): Promise<EventoPago | null> {
        const doc = await EventoPagoModelo.findById(eventoId).lean<EventoPagoDoc>();
        return doc
            ? new EventoPago(
                doc._id,
                doc.ordenId,
                aResultadoPago(doc.resultado),
                new Date(doc.fechaRecepcion),
                doc.respuesta
            )
            : null;
    }

    async guardar(evento: EventoPago): Promise<void> {
        await EventoPagoModelo.create({
            _id: evento.id,
            ordenId: evento.ordenId,
            resultado: evento.resultado,
            fechaRecepcion: evento.fechaRecepcion,
            respuesta: evento.respuesta
        });
    }

}

function aNotificacion(doc: NotificacionDoc): Notificacion {
    return new Notificacion(
        doc._id,
        doc.usuarioId,
        doc.tipo as TipoNotificacion,
        doc.mensaje,
        doc.subastaId ?? null,
        new Date(doc.fecha),
        doc.leida
    );
}

export class MongoNotificacionRepository implements NotificacionRepository {

    async guardar(n: Notificacion): Promise<void> {
        await NotificacionModelo.replaceOne(
            { _id: n.id },
            {
                _id: n.id,
                usuarioId: n.usuarioId,
                tipo: n.tipo,
                mensaje: n.mensaje,
                subastaId: n.subastaId,
                fecha: n.fecha,
                leida: n.estaLeida()
            },
            { upsert: true }
        );
    }

    async buscarPorId(id: string): Promise<Notificacion | null> {
        const doc = await NotificacionModelo.findById(id).lean<NotificacionDoc>();
        return doc ? aNotificacion(doc) : null;
    }

    async buscarPorUsuario(usuarioId: string, limite: number): Promise<Notificacion[]> {
        const docs = await NotificacionModelo.find({ usuarioId })
            .sort({ fecha: -1 })
            .limit(limite)
            .lean<NotificacionDoc[]>();
        return docs.map(aNotificacion);
    }

}
