import mongoose from "mongoose";

export async function conectarMongo(uri: string): Promise<void> {
    await mongoose.connect(uri);
    console.log("[infraestructura] MongoDB conectado");
}
