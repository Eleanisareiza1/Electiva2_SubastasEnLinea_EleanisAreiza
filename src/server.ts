import app from "./app";
import { createServer } from "http";
import { conectarMongo }from "./infrastructure/repositories/mongodb";
import { configurarSocket } from "./infrastructure/socket/socketServer";

const PORT: number = 5000;

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