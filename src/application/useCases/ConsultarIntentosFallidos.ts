import { SubastaRepository } from "../../domain/repositories/SubastaRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { buscarSubastaOFallar } from "./ConsultarDetalleSubasta";

export interface IntentoFallidoVista {
    postorId: string;
    postorNombre: string;
    valorOfrecido: number;
    codigo: string;
    motivo: string;
    fecha: string;
}

// RF-11: auditoría de intentos rechazados. El vendedor ve todos los de su
// subasta; cualquier otro usuario solo ve los suyos.
export class ConsultarIntentosFallidos {

    constructor(
        private readonly subastas: SubastaRepository,
        private readonly usuarios: UsuarioRepository
    ) {}

    async ejecutar(subastaId: string, solicitanteId: string): Promise<IntentoFallidoVista[]> {

        const subasta = await buscarSubastaOFallar(this.subastas, subastaId);

        const intentos = subasta
            .obtenerIntentosFallidos()
            .filter((i) => solicitanteId === subasta.vendedorId || i.postorId === solicitanteId);

        const usuarios = await this.usuarios.buscarPorIds([...new Set(intentos.map((i) => i.postorId))]);
        const nombres = new Map(usuarios.map((u) => [u.id, u.nombre]));

        return intentos
            .map((i) => ({
                postorId: i.postorId,
                postorNombre: nombres.get(i.postorId) ?? "Usuario",
                valorOfrecido: i.valorOfrecido,
                codigo: i.codigoRegla,
                motivo: i.motivo,
                fecha: i.fecha.toISOString()
            }))
            .reverse();
    }

}
