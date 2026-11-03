import app from "./app";
import { createServer } from "http";
import { conectarMongo }from "./infrastructure/repositories/mongodb";
import { configurarSocket } from "./infrastructure/socket/socketServer";

// Puerto HTTP utilizado por la API y las conexiones de Socket.IO.
const PORT: number = 5000;

// Conecta la base de datos y levanta el servidor HTTP con soporte de tiempo real.
async function iniciarServidor() {

    await conectarMongo();

    const servidorHttp =
        createServer(app);

    configurarSocket(
        servidorHttp
    );

    servidorHttp.listen(
        PORT,
        () => {

            console.log(
                `SERVER RUNNING AT ${PORT}`
            );

            console.log(
                "✅ Socket.IO iniciado"
            );

        }
    );

}

iniciarServidor();