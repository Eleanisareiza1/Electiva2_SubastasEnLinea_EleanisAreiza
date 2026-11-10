import mongoose from "mongoose";

const UsuarioSchema =
    new mongoose.Schema({

        nombre: {
            type: String,
            required: true
        },

        correo: {
            type: String,
            required: true,
            unique: true
        },

        passwordHash: {
            type: String,
            required: true
        }

    });

export const UsuarioModel =
    mongoose.model(
        "Usuario",
        UsuarioSchema
    );