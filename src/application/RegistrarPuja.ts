//Aqui estamos creando un caso de uso que se encarga de registrar una puja en una subasta.

import { SubastaRepository } from "../domain/subastaRepository";

interface RegistrarPujaDTO {
    indiceSubasta: number;
    usuarioId: string;
    valor: number;
}

export class RegistrarPuja {

    constructor(
        private readonly repository: SubastaRepository
    ) {}

    ejecutar(
        datos: RegistrarPujaDTO
    ): void {

       console.log(
    this.repository.obtenerTodas()
); 
        const subasta =
            this.repository.obtenerTodas()[
                datos.indiceSubasta
            ];

        if (!subasta) {
            throw new Error(
                "Subasta no encontrada"
            );
        }

        subasta.registrarPuja(
            datos.usuarioId,
            datos.valor
        );
    }
    

}

