import dotenv from "dotenv";

// Lee toda la configuración sensible o dependiente del entorno (RNF-10).
dotenv.config();

export type TipoPersistencia = "mongo" | "memoria";

export interface Entorno {
    puerto: number;
    persistencia: TipoPersistencia;
    mongodbUri: string | null;
    jwtSecret: string;
    jwtExpiracion: string;
    webhookSecret: string;
    origenesPermitidos: string[];
    sembrarDemo: boolean;
}

function requerida(nombre: string): string {
    const valor = process.env[nombre]?.trim();
    if (!valor) {
        throw new Error(
            `Falta la variable de entorno ${nombre}. Copie .env.example como .env y complétela.`
        );
    }
    return valor;
}

export function cargarEntorno(): Entorno {

    const mongodbUri = process.env.MONGODB_URI?.trim() || null;
    const persistenciaDeclarada = process.env.PERSISTENCIA?.trim().toLowerCase();

    const persistencia: TipoPersistencia =
        persistenciaDeclarada === "memoria" || persistenciaDeclarada === "mongo"
            ? persistenciaDeclarada
            : mongodbUri ? "mongo" : "memoria";

    if (persistencia === "mongo" && !mongodbUri) {
        throw new Error("PERSISTENCIA=mongo requiere la variable MONGODB_URI");
    }

    return {
        puerto: Number(process.env.PORT ?? 5000),
        persistencia,
        mongodbUri,
        jwtSecret: requerida("JWT_SECRET"),
        jwtExpiracion: process.env.JWT_EXPIRACION?.trim() || "8h",
        webhookSecret: requerida("WEBHOOK_SECRET"),
        origenesPermitidos: (process.env.CORS_ORIGENES ?? "http://localhost:4200")
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean),
        sembrarDemo: (process.env.SEMBRAR_DEMO ?? "false").toLowerCase() === "true"
    };
}
