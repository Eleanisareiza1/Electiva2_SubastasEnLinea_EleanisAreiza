//Definimos el recurso, la ruta y el método HTTP para crear una subasta

import express, { Router } from "express";
import { crearSubasta } from "../controllers/SubastaController";

const subastaRoutes: Router = express.Router();

subastaRoutes.post("/subastas", crearSubasta);

export default subastaRoutes;