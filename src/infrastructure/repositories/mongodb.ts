import mongoose from "mongoose";
import dotenv from "dotenv";

// Carga la configuración de entorno y establece la conexión con MongoDB.
dotenv.config();

// Falla explícitamente si falta la URI; al completar, deja la conexión lista para uso.
export async function conectarMongo(): Promise<void> {

    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error(
            "MONGODB_URI no configurada"
        );
    }

    await mongoose.connect(uri);

    console.log(
        "✅ MongoDB Atlas conectado"
    );

}