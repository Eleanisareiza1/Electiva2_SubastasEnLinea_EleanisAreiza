// Define los endpoints HTTP de consulta y administración de subastas y sus pujas.

import express, { Router } from "express";
import { crearSubasta, obtenerSubastas, registrarPuja, cancelarSubasta, cerrarSubasta} from "../controllers/SubastaController";

const subastaRoutes: Router = express.Router();

// Crea una subasta y devuelve la colección de subastas disponibles.
subastaRoutes.post("/subastas", crearSubasta);
subastaRoutes.get("/subastas", obtenerSubastas);
subastaRoutes.post("/subastas/:indice/pujas",registrarPuja); // Registra una puja en la subasta indicada.
subastaRoutes.patch("/subastas/:indice/cancelar", cancelarSubasta); // Solicita la cancelación de la subasta.
subastaRoutes.patch("/subastas/:indice/cerrar",cerrarSubasta); // Solicita el cierre de la subasta.

export default subastaRoutes;