import { createServer } from "http";
import { crearApp } from "./app";
import { BcryptCifrador } from "./infrastructure/auth/BcryptCifrador";
import { JwtGeneradorTokens } from "./infrastructure/auth/JwtGeneradorTokens";
import { UuidGeneradorIds } from "./infrastructure/auth/UuidGeneradorIds";
import { cargarEntorno } from "./infrastructure/config/entorno";
import { crearCasosDeUso, crearRepositorios } from "./infrastructure/contenedor";
import { sembrarDatosDemo } from "./infrastructure/herramientas/datosDemo";
import { conectarMongo } from "./infrastructure/repositories/mongo/conexion";
import { crearServidorTiempoReal } from "./infrastructure/socket/ServidorTiempoReal";
import { SocketIONotificacionAdapter } from "./infrastructure/socket/SocketIONotificacionAdapter";

async function iniciar(): Promise<void> {

    const entorno = cargarEntorno();

    if (entorno.persistencia === "mongo" && entorno.mongodbUri) {
        await conectarMongo(entorno.mongodbUri);
    }

    const repositorios = await crearRepositorios(entorno.persistencia);
    const tokens = new JwtGeneradorTokens(entorno.jwtSecret, entorno.jwtExpiracion);
    const cifrador = new BcryptCifrador();
    const ids = new UuidGeneradorIds();

    // El servidor HTTP se crea primero para que REST y WebSockets compartan puerto.
    const servidorHttp = createServer();
    const io = crearServidorTiempoReal(servidorHttp, tokens, entorno.origenesPermitidos);

    const casos = crearCasosDeUso(repositorios, {
        tiempoReal: new SocketIONotificacionAdapter(io),
        cifrador,
        tokens,
        ids
    });

    if (entorno.sembrarDemo) {
        await sembrarDatosDemo(repositorios, cifrador, ids);
    }

    servidorHttp.on("request", crearApp(casos, tokens, {
        webhookSecret: entorno.webhookSecret,
        origenesPermitidos: entorno.origenesPermitidos
    }));

    servidorHttp.listen(entorno.puerto, () => {
        console.log(`[infraestructura] API REST y WebSockets en http://localhost:${entorno.puerto}/api/v1`);
        console.log(`[infraestructura] Persistencia: ${entorno.persistencia}`);
    });
}

process.on("unhandledRejection", (error) => console.error("[error] Promesa rechazada sin manejar", error));

iniciar().catch((error: unknown) => {
    console.error("[error] No fue posible iniciar el servidor:", error instanceof Error ? error.message : error);
    process.exit(1);
});
