import { Usuario } from "./Usuario";

export interface UsuarioRepository {

    guardar(
        usuario: Usuario
    ): Promise<void>;

    buscarPorCorreo(
        correo: string
    ): Promise<Usuario | null>;

}