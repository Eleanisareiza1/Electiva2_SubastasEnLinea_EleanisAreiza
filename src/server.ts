import app from "./app";
import { conectarMongo } from "./infrastructure/repositories/mongodb";

const PORT: number = 5000;

async function iniciarServidor() {

    await conectarMongo();

    app.listen(PORT, () => {

        console.log(
            `SERVER RUNNING AT ${PORT}`
        );

    });

}

iniciarServidor();