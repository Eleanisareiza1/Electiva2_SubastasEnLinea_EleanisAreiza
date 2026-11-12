import { Subasta } from "./Subasta";

// Contrato de persistencia que desacopla los casos de uso del motor de almacenamiento.
export interface SubastaRepository {

    // Persiste una subasta nueva o sus cambios.
    guardar(
        subasta: Subasta
    ): Promise<void>;

    // Recupera las subastas disponibles como entidades de dominio.
    obtenerTodas():
        Promise<Subasta[]>;

        
}