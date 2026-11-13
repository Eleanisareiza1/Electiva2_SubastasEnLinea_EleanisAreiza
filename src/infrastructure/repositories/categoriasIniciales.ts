import { Categoria } from "../../domain/Categoria";

// Catálogo inicial de categorías que se carga en cualquier persistencia.
export const CATEGORIAS_INICIALES: Categoria[] = [
    new Categoria("vehiculos", "Vehículos", "Carros, motos y repuestos"),
    new Categoria("tecnologia", "Tecnología", "Computadores, celulares y electrónica"),
    new Categoria("hogar", "Hogar", "Muebles, electrodomésticos y decoración"),
    new Categoria("moda", "Moda", "Ropa, calzado y accesorios"),
    new Categoria("arte", "Arte y colección", "Obras, antigüedades y coleccionables"),
    new Categoria("deportes", "Deportes", "Equipos y artículos deportivos")
];
