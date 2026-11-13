// Esquemas de MongoDB. Son detalles de infraestructura: el dominio no los conoce.
import mongoose, { Schema } from "mongoose";

export interface PujaDoc {
    postorId: string;
    valor: number;
    fecha: Date;
}

export interface IntentoDoc {
    postorId: string;
    valorOfrecido: number;
    codigoRegla: string;
    motivo: string;
    fecha: Date;
}

export interface OrdenDoc {
    id: string;
    ganadorId: string;
    valor: number;
    fechaEmision: Date;
    fechaLimite: Date;
    estado: string;
    fechaPago: Date | null;
}

export interface SubastaDoc {
    _id: string;
    vendedorId: string;
    articulo: {
        id: string;
        nombre: string;
        descripcion: string;
        estadoConservacion: string;
        categoriaId: string;
        imagenUrl: string | null;
    };
    precioBase: number;
    incrementoMinimo: number;
    fechaPublicacion: Date;
    fechaCierre: Date;
    estado: string;
    pujas: PujaDoc[];
    participantes: string[];
    intentosFallidos: IntentoDoc[];
    ganadorId: string | null;
    ordenPago: OrdenDoc | null;
}

export interface UsuarioDoc {
    _id: string;
    nombre: string;
    correo: string;
    passwordHash: string;
    fechaRegistro: Date;
}

export interface CategoriaDoc {
    _id: string;
    nombre: string;
    descripcion: string;
}

export interface EventoPagoDoc {
    _id: string;
    ordenId: string;
    resultado: string;
    fechaRecepcion: Date;
    respuesta: {
        eventoId: string;
        ordenId: string;
        procesado: boolean;
        estadoOrden: string | null;
        mensaje: string;
    };
}

export interface NotificacionDoc {
    _id: string;
    usuarioId: string;
    tipo: string;
    mensaje: string;
    subastaId: string | null;
    fecha: Date;
    leida: boolean;
}

const SubastaSchema = new Schema<SubastaDoc>(
    {
        _id: { type: String, required: true },
        vendedorId: { type: String, required: true, index: true },
        articulo: {
            id: { type: String, required: true },
            nombre: { type: String, required: true },
            descripcion: { type: String, required: true },
            estadoConservacion: { type: String, required: true },
            categoriaId: { type: String, required: true, index: true },
            imagenUrl: { type: String, default: null }
        },
        precioBase: { type: Number, required: true },
        incrementoMinimo: { type: Number, required: true },
        fechaPublicacion: { type: Date, required: true },
        fechaCierre: { type: Date, required: true, index: true },
        estado: { type: String, required: true, index: true },
        pujas: [{ _id: false, postorId: String, valor: Number, fecha: Date }],
        participantes: { type: [String], index: true },
        intentosFallidos: [
            { _id: false, postorId: String, valorOfrecido: Number, codigoRegla: String, motivo: String, fecha: Date }
        ],
        ganadorId: { type: String, default: null, index: true },
        ordenPago: {
            type: new Schema<OrdenDoc>(
                {
                    id: { type: String, required: true },
                    ganadorId: String,
                    valor: Number,
                    fechaEmision: Date,
                    fechaLimite: Date,
                    estado: String,
                    fechaPago: { type: Date, default: null }
                },
                { _id: false }
            ),
            default: null
        }
    },
    { versionKey: false }
);

SubastaSchema.index({ "ordenPago.id": 1 });

const UsuarioSchema = new Schema<UsuarioDoc>(
    {
        _id: { type: String, required: true },
        nombre: { type: String, required: true },
        // RN-22: índice único como respaldo de la validación de la aplicación.
        correo: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        fechaRegistro: { type: Date, required: true }
    },
    { versionKey: false }
);

const CategoriaSchema = new Schema<CategoriaDoc>(
    {
        _id: { type: String, required: true },
        nombre: { type: String, required: true },
        descripcion: { type: String, required: true }
    },
    { versionKey: false }
);

const EventoPagoSchema = new Schema<EventoPagoDoc>(
    {
        _id: { type: String, required: true },
        ordenId: { type: String, required: true },
        resultado: { type: String, required: true },
        fechaRecepcion: { type: Date, required: true },
        respuesta: {
            eventoId: String,
            ordenId: String,
            procesado: Boolean,
            estadoOrden: { type: String, default: null },
            mensaje: String
        }
    },
    { versionKey: false }
);

const NotificacionSchema = new Schema<NotificacionDoc>(
    {
        _id: { type: String, required: true },
        usuarioId: { type: String, required: true, index: true },
        tipo: { type: String, required: true },
        mensaje: { type: String, required: true },
        subastaId: { type: String, default: null },
        fecha: { type: Date, required: true },
        leida: { type: Boolean, default: false }
    },
    { versionKey: false }
);

// Colecciones propias de esta versión del modelo (las de la entrega 2 no se reutilizan).
export const SubastaModelo = mongoose.model<SubastaDoc>("Subasta", SubastaSchema, "plataforma_subastas");
export const UsuarioModelo = mongoose.model<UsuarioDoc>("Usuario", UsuarioSchema, "plataforma_usuarios");
export const CategoriaModelo = mongoose.model<CategoriaDoc>("Categoria", CategoriaSchema, "plataforma_categorias");
export const EventoPagoModelo = mongoose.model<EventoPagoDoc>("EventoPago", EventoPagoSchema, "plataforma_eventos_pago");
export const NotificacionModelo = mongoose.model<NotificacionDoc>("Notificacion", NotificacionSchema, "plataforma_notificaciones");
