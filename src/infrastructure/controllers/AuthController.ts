import {  Request,  Response, NextFunction} from "express";
import {RegistrarUsuario}from "../../application/RegistrarUsuario";
import { IniciarSesion } from "../../application/IniciarSesion";
import { usuarioRepository} from "../repositories/repositories";
import { ConsultarPerfil} from "../../application/ConsultarPerfil";
import { AuthRequest} from "../middlewares/authMiddleware";


export const register = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {

    try {

        const {
            nombre,
            correo,
            password
        } = request.body;

        const casoDeUso =
            new RegistrarUsuario(
                usuarioRepository
            );

        const usuario =
            await casoDeUso.ejecutar({
                nombre,
                correo,
                password
            });

        return response.status(201).json({
            ok: true,
            data: {
                nombre: usuario.nombre,
                correo: usuario.correo
            }
        });

    } catch (error) {

        next(error);

    }

};

export const login = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {

    try {

        const {
            correo,
            password
        } = request.body;

        const casoDeUso =
            new IniciarSesion(
                usuarioRepository
            );

        const token =
            await casoDeUso.ejecutar({
                correo,
                password
            });

        return response.status(200).json({
            ok: true,
            token
        });

    } catch (error) {

        next(error);

    }

};

export const profile = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
) => {

    try {

        const casoDeUso =
            new ConsultarPerfil(
                usuarioRepository
            );

        const usuario =
            await casoDeUso.ejecutar(
                request.usuario!.correo
            );

        return response.status(200).json({
            ok: true,
            data: {
                nombre:
                    usuario?.nombre,
                correo:
                    usuario?.correo
            }
        });

    } catch (error) {

        next(error);

    }

};