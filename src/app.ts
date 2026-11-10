// Configura Express con el análisis JSON, las rutas versionadas y el middleware de errores.
import { errorHandler } from "./infrastructure/middlewares/errorHandler";
import express, { Application } from "express";
import authRoutes from "./infrastructure/routes/authRoutes";
import subastaRoutes from "./infrastructure/routes/subastaRoutes";

const app: Application = express();

app.use(express.json());
app.use("/api/v1", subastaRoutes);
app.use("/api/v1", authRoutes);
app.use(errorHandler);

export default app;