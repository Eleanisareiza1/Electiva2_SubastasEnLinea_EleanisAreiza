//Definimos el recurso, la ruta y el método HTTP para crear una subasta


import express, { Router } from "express";
import { crearSubasta, obtenerSubastas } from "../controllers/SubastaController";

const subastaRoutes: Router = express.Router();

subastaRoutes.post("/subastas", crearSubasta);
subastaRoutes.get("/subastas", obtenerSubastas);

export default subastaRoutes;