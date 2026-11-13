import { CategoriaRepository } from "../../domain/repositories/CategoriaRepository";

export interface CategoriaVista {
    id: string;
    nombre: string;
    descripcion: string;
}

export class ListarCategorias {

    constructor(private readonly categorias: CategoriaRepository) {}

    async ejecutar(): Promise<CategoriaVista[]> {
        const categorias = await this.categorias.obtenerTodas();
        return categorias.map((c) => ({ id: c.id, nombre: c.nombre, descripcion: c.descripcion }));
    }

}
