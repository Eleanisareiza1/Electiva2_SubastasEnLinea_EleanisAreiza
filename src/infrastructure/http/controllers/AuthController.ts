import { Request, Response } from "express";
import { CasosDeUso } from "../../contenedor";
import { obtenerSesion } from "../middlewares/autenticacion";
import { LectorCuerpo } from "../validaciones";

// Los controladores traducen HTTP <-> casos de uso. No contienen reglas de negocio.
export function crearAuthController(casos: CasosDeUso) {
    return {

        async registrar(request: Request, response: Response): Promise<void> {
            const cuerpo = new LectorCuerpo(request.body);
            const datos = {
                nombre: cuerpo.texto("nombre", { max: 80 }),
                correo: cuerpo.texto("correo", { max: 254 }),
                password: cuerpo.texto("password", { max: 72 })
            };
            cuerpo.verificar();
            if (datos.password.length < 8) {
                response.status(400).json({
                    ok: false,
                    error: { codigo: "PASSWORD_DEBIL", mensaje: "La contraseña debe tener al menos 8 caracteres" }
                });
                return;
            }
            const usuario = await casos.registrarUsuario.ejecutar(datos);
            response.status(201).json({ ok: true, data: usuario });
        },

        async iniciarSesion(request: Request, response: Response): Promise<void> {
            const cuerpo = new LectorCuerpo(request.body);
            const datos = { correo: cuerpo.texto("correo"), password: cuerpo.texto("password") };
            cuerpo.verificar();
            const sesion = await casos.iniciarSesion.ejecutar(datos);
            response.status(200).json({ ok: true, data: sesion });
        },

        async perfil(_request: Request, response: Response): Promise<void> {
            const sesion = obtenerSesion(response);
            const perfil = await casos.consultarPerfil.ejecutar(sesion.usuarioId);
            response.status(200).json({ ok: true, data: perfil });
        }

    };
}
