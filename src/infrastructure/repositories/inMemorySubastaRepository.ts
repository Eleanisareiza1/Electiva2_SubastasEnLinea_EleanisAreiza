//Estamos implementando un repositorio en memoria para almacenar subastas. Este repositorio implementa la interfaz SubastaRepository y proporciona métodos para guardar y obtener subastas.

import { Subasta } from "../../domain/Subasta";
import { SubastaRepository } from "../../domain/subastaRepository";

export class InMemorySubastaRepository
    implements SubastaRepository {

    private subastas: Subasta[] = [];

    guardar(subasta: Subasta): void {
        this.subastas.push(subasta);
    }

    obtenerTodas(): Subasta[] {
        return this.subastas;
    }   

}