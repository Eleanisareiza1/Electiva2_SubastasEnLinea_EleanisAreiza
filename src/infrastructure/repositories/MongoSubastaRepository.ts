import { Subasta } from "../../domain/Subasta";
import { SubastaRepository } from "../../domain/subastaRepository";
import { SubastaModel } from "./SubastaModel";
import { Dinero } from "../../domain/valueObjects/Dinero";
import { EstadoSubasta } from "../../domain/valueObjects/EstadoSubasta";


export class MongoSubastaRepository
    implements SubastaRepository {

    async guardar(
        subasta: Subasta
    ): Promise<void> {

        await SubastaModel.create({

            vendedorId:
                subasta.vendedorId,

            titulo:
                subasta.titulo,

            precioBase:
                subasta.precioBase.obtenerValor(),

            incrementoMinimo:
                subasta.incrementoMinimo.obtenerValor(),

            fechaPublicacion:
                subasta.fechaPublicacion,

            fechaCierre:
                subasta.fechaCierre,

            estado:
                subasta.obtenerEstado()

        });

    }

    async obtenerTodas():
    Promise<Subasta[]> {

    const documentos =
        await SubastaModel.find();

    return documentos.map(
    (documento) =>
        Subasta.reconstruir(
            documento.titulo!,
            documento.vendedorId!,
            new Dinero(
                documento.precioBase!
            ),
            new Dinero(
                documento.incrementoMinimo!
            ),
            documento.fechaPublicacion!,
            documento.fechaCierre!,
            documento.estado as EstadoSubasta
        )
);

}

}