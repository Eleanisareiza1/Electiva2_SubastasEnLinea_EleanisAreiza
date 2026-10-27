import mongoose from "mongoose";

const SubastaSchema =
    new mongoose.Schema({

        vendedorId: String,

        titulo: String,

        precioBase: Number,

        incrementoMinimo: Number,

        fechaPublicacion: Date,

        fechaCierre: Date,

        estado: String

    });

export const SubastaModel =
    mongoose.model(
        "Subasta",
        SubastaSchema
    );