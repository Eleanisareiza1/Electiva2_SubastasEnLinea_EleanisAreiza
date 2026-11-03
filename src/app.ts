//Estamos configurando el servidor de express y las rutas de la API
import { errorHandler } from "./infrastructure/middlewares/errorHandler";
import express, { Application } from "express";
import subastaRoutes from "./infrastructure/routes/subastaRoutes";

const app: Application = express();

app.use(express.json());

app.use("/api/v1", subastaRoutes);

app.use(errorHandler);

export default app;