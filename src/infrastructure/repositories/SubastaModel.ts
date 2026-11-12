import mongoose from "mongoose";

// Esquemas MongoDB para las pujas, intentos fallidos, orden de pago y subasta.
const PujaSchema =
    new mongoose.Schema({

        usuarioId: String,

        valor: Number,

        fecha: Date

    });

const IntentoFallidoSchema =
    new mongoose.Schema({

        usuarioId: String,

        motivo: String,

        fecha: Date

    });

const OrdenPagoSchema =
    new mongoose.Schema({

        usuarioId: String,

        valor: Number,

        fechaLimite: Date,

        estado: String

    });


const SubastaSchema =
    new mongoose.Schema({

        vendedorId: String,

        titulo: String,

        precioBase: Number,

        incrementoMinimo: Number,

        fechaPublicacion: Date,

        fechaCierre: Date,

        estado: String,

        ganadorId: String,

        pujas: [PujaSchema],

        intentosFallidos: [
            IntentoFallidoSchema
        ],

        ordenPago: OrdenPagoSchema

    });

export const SubastaModel =
    mongoose.model(
        "Subasta",
        SubastaSchema
    );