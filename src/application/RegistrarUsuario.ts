import { Usuario } from "../domain/Usuario";
import { UsuarioRepository } from "../domain/UsuarioRepository";
import { hashPassword } from "../infrastructure/auth/password";

interface RegistrarUsuarioDTO {

    nombre: string;
    correo: string;
    password: string;

}

export class RegistrarUsuario {

    constructor(
        private readonly repository:
        UsuarioRepository
    ) {}

    async ejecutar(
        datos: RegistrarUsuarioDTO
    ): Promise<Usuario> {

        const existente =
            await this.repository
            .buscarPorCorreo(
                datos.correo
            );

        if (existente) {

            throw new Error(
                "RN-22: El correo ya existe"
            );

        }

        const passwordHash =
            await hashPassword(
                datos.password
            );

        const usuario =
            new Usuario(
                datos.nombre,
                datos.correo,
                passwordHash
            );

        await this.repository
        .guardar(usuario);

        return usuario;

    }

}