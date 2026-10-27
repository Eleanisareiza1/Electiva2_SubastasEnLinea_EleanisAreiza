import { Subasta } from "./Subasta";

export interface SubastaRepository {

    guardar(
        subasta: Subasta
    ): Promise<void>;

    obtenerTodas():
        Promise<Subasta[]>;

}