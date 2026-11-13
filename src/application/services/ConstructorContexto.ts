import { Subasta } from "../../domain/Subasta";
import { CategoriaRepository } from "../../domain/repositories/CategoriaRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { ContextoVista } from "./Vistas";

// Reúne los nombres de usuarios y categorías que necesitan las vistas,
// con una sola consulta por repositorio.
export class ConstructorContexto {

    constructor(
        private readonly usuarios: UsuarioRepository,
        private readonly categorias: CategoriaRepository
    ) {}

    async construir(subastas: Subasta[]): Promise<ContextoVista> {

        const ids = new Set<string>();

        for (const subasta of subastas) {
            ids.add(subasta.vendedorId);
            subasta.obtenerParticipantesIds().forEach((id) => ids.add(id));
        }

        const [usuarios, categorias] = await Promise.all([
            this.usuarios.buscarPorIds([...ids]),
            this.categorias.obtenerTodas()
        ]);

        return {
            nombresUsuarios: new Map(usuarios.map((u) => [u.id, u.nombre])),
            nombresCategorias: new Map(categorias.map((c) => [c.id, c.nombre]))
        };
    }

}
