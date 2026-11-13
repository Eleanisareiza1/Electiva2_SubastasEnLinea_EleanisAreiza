import { Articulo } from "../../domain/Articulo";
import { Subasta } from "../../domain/Subasta";
import { ErrorDominio } from "../../domain/errors/ErrorDominio";
import { CategoriaRepository } from "../../domain/repositories/CategoriaRepository";
import { SubastaRepository } from "../../domain/repositories/SubastaRepository";
import { Dinero } from "../../domain/valueObjects/Dinero";
import { aEstadoConservacion } from "../../domain/valueObjects/EstadoConservacion";
import { GeneradorIds } from "../ports/GeneradorIds";
import { ConstructorContexto } from "../services/ConstructorContexto";
import { SubastaResumenVista, aVistaResumen } from "../services/Vistas";

export interface PublicarSubastaDTO {
    vendedorId: string;
    nombre: string;
    descripcion: string;
    estadoConservacion: string;
    categoriaId: string;
    imagenUrl?: string | null;
    precioBase: number;
    incrementoMinimo: number;
    fechaCierre: Date;
}

// RF-04: publicación de una subasta. Las reglas RN-01, RN-02 y RN-03 las
// decide Subasta.publicar(); este caso de uso solo orquesta.
export class PublicarSubasta {

    constructor(
        private readonly subastas: SubastaRepository,
        private readonly categorias: CategoriaRepository,
        private readonly ids: GeneradorIds,
        private readonly contexto: ConstructorContexto
    ) {}

    async ejecutar(datos: PublicarSubastaDTO): Promise<SubastaResumenVista> {

        if (!(await this.categorias.buscarPorId(datos.categoriaId))) {
            throw new ErrorDominio(
                "CATEGORIA_INEXISTENTE",
                "La categoría indicada no existe",
                "VALIDACION"
            );
        }

        const articulo = Articulo.crear({
            id: this.ids.generar(),
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            estadoConservacion: aEstadoConservacion(datos.estadoConservacion),
            categoriaId: datos.categoriaId,
            imagenUrl: datos.imagenUrl
        });

        const subasta = Subasta.publicar({
            id: this.ids.generar(),
            vendedorId: datos.vendedorId,
            articulo,
            precioBase: new Dinero(datos.precioBase),
            incrementoMinimo: new Dinero(datos.incrementoMinimo),
            fechaCierre: datos.fechaCierre
        });

        await this.subastas.guardar(subasta);

        console.log(`[negocio] Subasta publicada: ${subasta.id} «${articulo.nombre}»`);

        return aVistaResumen(subasta, await this.contexto.construir([subasta]));
    }

}
