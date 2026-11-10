import { Usuario } from "../../domain/Usuario";
import {
    UsuarioRepository
} from "../../domain/UsuarioRepository";

import {
    UsuarioModel
} from "./UsuarioModel";

export class MongoUsuarioRepository
implements UsuarioRepository {

    async guardar(
        usuario: Usuario
    ): Promise<void> {

        await UsuarioModel.create({

            nombre:
                usuario.nombre,

            correo:
                usuario.correo,

            passwordHash:
                usuario.passwordHash

        });

    }

    async buscarPorCorreo(
        correo: string
    ): Promise<Usuario | null> {

        const usuario =
            await UsuarioModel.findOne({
                correo
            });

        if (!usuario) {

            return null;

        }

        return new Usuario(
            usuario.nombre,
            usuario.correo,
            usuario.passwordHash
        );

    }

}