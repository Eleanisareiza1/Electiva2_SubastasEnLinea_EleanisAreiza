import { Usuario } from "../domain/Usuario";
import { UsuarioRepository } from "../domain/UsuarioRepository";

export class ConsultarPerfil {

    constructor(
        private readonly repository:
        UsuarioRepository
    ) {}

    async ejecutar(
        correo: string
    ): Promise<Usuario | null> {

        return await this.repository
            .buscarPorCorreo(
                correo
            );

    }

}