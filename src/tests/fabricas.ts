// Utilidades para construir objetos de prueba.
import { Articulo } from "../domain/Articulo";
import { Subasta } from "../domain/Subasta";
import { Dinero } from "../domain/valueObjects/Dinero";
import { EstadoConservacion } from "../domain/valueObjects/EstadoConservacion";

export const HORA = 60 * 60 * 1000;
export const T0 = new Date("2026-11-20T12:00:00-05:00");

export const enHoras = (horas: number): Date => new Date(T0.getTime() + horas * HORA);

export function articuloDePrueba(): Articulo {
    return Articulo.crear({
        id: "art-1",
        nombre: "Laptop Gamer",
        descripcion: "Portátil con tarjeta gráfica dedicada",
        estadoConservacion: EstadoConservacion.USADO,
        categoriaId: "tecnologia"
    });
}

export function subastaDePrueba(opciones: {
    precioBase?: number;
    incremento?: number;
    horas?: number;
    id?: string;
} = {}): Subasta {
    return Subasta.publicar(
        {
            id: opciones.id ?? "subasta-1",
            vendedorId: "vendedor",
            articulo: articuloDePrueba(),
            precioBase: new Dinero(opciones.precioBase ?? 1000),
            incrementoMinimo: new Dinero(opciones.incremento ?? 100),
            fechaCierre: enHoras(opciones.horas ?? 24)
        },
        T0
    );
}
