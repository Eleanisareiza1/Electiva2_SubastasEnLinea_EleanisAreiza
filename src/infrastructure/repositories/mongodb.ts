import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

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