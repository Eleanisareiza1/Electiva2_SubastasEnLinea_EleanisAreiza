import { Usuario } from "../Usuario";
import { Correo } from "../valueObjects/Correo";

// Puerto de persistencia de usuarios.
export interface UsuarioRepository {

    // Debe rechazar un correo repetido con un ErrorDominio RN-22.
    guardar(usuario: Usuario): Promise<void>;

    buscarPorId(id: string): Promise<Usuario | null>;

    buscarPorCorreo(correo: Correo): Promise<Usuario | null>;

    buscarPorIds(ids: string[]): Promise<Usuario[]>;

}
