import { Subasta } from "../../domain/Subasta";
import { SubastaRepository } from "../../domain/subastaRepository";
import { SubastaModel } from "./SubastaModel";
import { Dinero } from "../../domain/valueObjects/Dinero";
import { EstadoSubasta } from "../../domain/valueObjects/EstadoSubasta";
import { Puja } from "../../domain/Puja";
import { OrdenPago } from "../../domain/OrdenPago";
import { EstadoPago } from "../../domain/valueObjects/EstadoPago";

// Adaptador de persistencia que traduce entre las entidades de dominio y MongoDB.
export class MongoSubastaRepository
    implements SubastaRepository {

    // Guarda o actualiza el documento identificado por título y vendedor.
    async guardar(
    subasta: Subasta
): Promise<void> {

    await SubastaModel.findOneAndUpdate(
        {
            titulo: subasta.titulo,
            vendedorId: subasta.vendedorId
        },
        {
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
                subasta.obtenerEstado(),

            ganadorId:
                subasta.obtenerGanadorId(),

            pujas:
                subasta.obtenerPujas().map(
                    (puja) => ({
                        usuarioId:
                            puja.usuarioId,

                        valor:
                            puja.valor.obtenerValor(),

                        fecha:
                            puja.fecha
                    })
                ),

            intentosFallidos:
                subasta.obtenerIntentosFallidos()
                .map(
                    (intento) => ({
                        usuarioId:
                            intento.usuarioId,

                        motivo:
                            intento.motivo,

                        fecha:
                            intento.fecha
                    })
                ),

            ordenPago:
            subasta.obtenerOrdenPago()
                ? {
                    usuarioId:
                        subasta.obtenerOrdenPago()!.ganadorId,

                    valor:
                        subasta.obtenerOrdenPago()!.valor,

                    fechaLimite:
                        subasta.obtenerOrdenPago()!.fechaLimite,

                    estado:
                        subasta
                            .obtenerOrdenPago()!
                            .obtenerEstado()
                }
                    : null

        },
        {
            upsert: true,
            new: true
        }
    );

}

    // Recupera los documentos y reconstruye las entidades y sus objetos de valor.
    async obtenerTodas():
    Promise<Subasta[]> {

    const documentos =
        await SubastaModel.find();

   return documentos.map(
    (documento) => {

        const pujas =
            (documento.pujas ?? []).map(
                (puja: any) =>
                    Puja.reconstruir(
                        puja.usuarioId,
                        new Dinero(
                            puja.valor
                        ),
                        puja.fecha
                    )
            );
            const ordenPago =
            documento.ordenPago
                ? new OrdenPago(
                    documento.ordenPago.usuarioId!,
                    documento.ordenPago.valor!,
                    documento.ordenPago.fechaLimite!,
                    documento.ordenPago.estado as EstadoPago
                )
                : null;

       return Subasta.reconstruir(
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
            documento.estado as EstadoSubasta,
            pujas,
            documento.ganadorId ?? null,
            ordenPago
        );

    }
);

}

}