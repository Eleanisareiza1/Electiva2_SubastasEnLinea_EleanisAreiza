//Estamos diciendole al domicio que necesitamos guardar y obtener subastas que podria ser en "memoria",
// "mongoDB","PostgreSQL","ArchivoJson". 

import { Subasta } from "./Subasta";

export interface SubastaRepository {

    guardar(subasta: Subasta): void;

    obtenerTodas(): Subasta[];

}
