import { UsuarioRepository }from "../domain/UsuarioRepository";
import {  comparePassword }from "../infrastructure/auth/password";
import {  generarToken }from "../infrastructure/auth/jwt";

interface IniciarSesionDTO {

    correo: string;
    password: string;

}

export class IniciarSesion {

    constructor(
        private readonly repository:
        UsuarioRepository
    ) {}

    async ejecutar(
        datos: IniciarSesionDTO
    ): Promise<string> {

        const usuario =
            await this.repository
            .buscarPorCorreo(
                datos.correo
            );

        if (!usuario) {

            throw new Error(
                "Credenciales inválidas"
            );

        }

        const passwordValida =
            await comparePassword(
                datos.password,
                usuario.passwordHash
            );

        if (!passwordValida) {

            throw new Error(
                "Credenciales inválidas"
            );

        }

        return generarToken(
            usuario.correo
        );

    }

}