import express from "express";

import {
    obtenerOrdenes
} from "../controllers/OrdenController";

import {
    authMiddleware
} from "../middlewares/authMiddleware";

const ordenRoutes =
    express.Router();

ordenRoutes.get(
    "/ordenes",
    authMiddleware,
    obtenerOrdenes
);

export default ordenRoutes;