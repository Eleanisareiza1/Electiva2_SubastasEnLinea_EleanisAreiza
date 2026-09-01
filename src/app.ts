//Estamos configurando el servidor de express y las rutas de la API

import express, { Application } from "express";
import subastaRoutes from "./infrastructure/routes/subastaRoutes";

const app: Application = express();

app.use(express.json());

app.use("/api/v1", subastaRoutes);

export default app;