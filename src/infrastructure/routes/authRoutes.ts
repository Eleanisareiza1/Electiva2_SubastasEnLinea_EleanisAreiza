import express from "express";

import { register, login, profile} from "../controllers/AuthController";
import {authMiddleware}from "../middlewares/authMiddleware";


const authRoutes =
    express.Router();

authRoutes.post("/auth/register",register);
authRoutes.post("/auth/login", login);
authRoutes.get("/auth/profile",authMiddleware,profile);
export default authRoutes;