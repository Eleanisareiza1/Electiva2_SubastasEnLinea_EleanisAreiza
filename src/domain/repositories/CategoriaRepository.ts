import { Categoria } from "../Categoria";

// Puerto de consulta de categorías.
export interface CategoriaRepository {

    obtenerTodas(): Promise<Categoria[]>;

    buscarPorId(id: string): Promise<Categoria | null>;

}
