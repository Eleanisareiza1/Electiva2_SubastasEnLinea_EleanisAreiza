//Definimos el recurso, la ruta y el método HTTP para crear una subasta


import express, { Router } from "express";
import { crearSubasta, obtenerSubastas, registrarPuja, cancelarSubasta, cerrarSubasta} from "../controllers/SubastaController";

const subastaRoutes: Router = express.Router();

subastaRoutes.post("/subastas", crearSubasta);
subastaRoutes.get("/subastas", obtenerSubastas);
subastaRoutes.post("/subastas/:indice/pujas",registrarPuja);
subastaRoutes.patch("/subastas/:indice/cancelar", cancelarSubasta); //ESTAMOS CAMBIANDO EL ESTADO DE LA SUBASTA
subastaRoutes.patch("/subastas/:indice/cerrar",cerrarSubasta);

export default subastaRoutes;