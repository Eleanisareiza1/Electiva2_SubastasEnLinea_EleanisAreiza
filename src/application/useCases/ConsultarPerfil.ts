import { ErrorDominio } from "../../domain/errors/ErrorDominio";
import { SubastaRepository } from "../../domain/repositories/SubastaRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { EstadoSubasta } from "../../domain/valueObjects/EstadoSubasta";
import { ConstructorContexto } from "../services/ConstructorContexto";
import { SincronizadorSubastas } from "../services/SincronizadorSubastas";
import {
    SubastaResumenVista,
    UsuarioVista,
    aVistaResumen,
    aVistaUsuario
} from "../services/Vistas";

export interface PerfilVista {
    usuario: UsuarioVista;
    publicadas: SubastaResumenVista[];
    participadas: SubastaResumenVista[];
    estadisticas: {
        publicadas: number;
        participando: number;
        ganadas: number;
        liderando: number;
    };
}

// RF-03: perfil con las subastas publicadas y aquellas en las que participó.
export class ConsultarPerfil {

    constructor(
        private readonly usuarios: UsuarioRepository,
        private readonly subastas: SubastaRepository,
        private readonly sincronizador: SincronizadorSubastas,
        private readonly contexto: ConstructorContexto
    ) {}

    async ejecutar(usuarioId: string): Promise<PerfilVista> {

        const usuario = await this.usuarios.buscarPorId(usuarioId);

        if (!usuario) {
            throw new ErrorDominio("USUARIO_NO_ENCONTRADO", "El usuario no existe", "NO_ENCONTRADO");
        }

        await this.sincronizador.sincronizarPendientes();

        const [publicadas, participadas] = await Promise.all([
            this.subastas.buscarPorVendedor(usuarioId),
            this.subastas.buscarPorParticipante(usuarioId)
        ]);

        const contexto = await this.contexto.construir([...publicadas, ...participadas]);

        return {
            usuario: aVistaUsuario(usuario),
            publicadas: publicadas.map((s) => aVistaResumen(s, contexto)),
            participadas: participadas.map((s) => aVistaResumen(s, contexto)),
            estadisticas: {
                publicadas: publicadas.length,
                participando: participadas.filter((s) => s.obtenerEstado() === EstadoSubasta.ABIERTA).length,
                ganadas: participadas.filter((s) => s.obtenerGanadorId() === usuarioId).length,
                liderando: participadas.filter(
                    (s) =>
                        s.obtenerEstado() === EstadoSubasta.ABIERTA &&
                        s.obtenerPujaVigente()?.postorId === usuarioId
                ).length
            }
        };
    }

}
