import { ErrorDominio } from "./errors/ErrorDominio";
import { EstadoConservacion } from "./valueObjects/EstadoConservacion";

// Bien que se ofrece a la venta. Vive dentro del agregado Subasta: no se
// publica ni se modifica por separado.
export class Articulo {

    private constructor(
        public readonly id: string,
        public readonly nombre: string,
        public readonly descripcion: string,
        public readonly estadoConservacion: EstadoConservacion,
        public readonly categoriaId: string,
        public readonly imagenUrl: string | null
    ) {}

    static crear(datos: {
        id: string;
        nombre: string;
        descripcion: string;
        estadoConservacion: EstadoConservacion;
        categoriaId: string;
        imagenUrl?: string | null;
    }): Articulo {

        const nombre = (datos.nombre ?? "").trim();
        const descripcion = (datos.descripcion ?? "").trim();

        if (nombre.length < 3 || nombre.length > 120) {
            throw new ErrorDominio(
                "ARTICULO_NOMBRE_INVALIDO",
                "El nombre del artículo debe tener entre 3 y 120 caracteres",
                "VALIDACION"
            );
        }

        if (descripcion.length < 10 || descripcion.length > 2000) {
            throw new ErrorDominio(
                "ARTICULO_DESCRIPCION_INVALIDA",
                "La descripción del artículo debe tener entre 10 y 2000 caracteres",
                "VALIDACION"
            );
        }

        if (!datos.categoriaId) {
            throw new ErrorDominio(
                "CATEGORIA_REQUERIDA",
                "El artículo debe pertenecer a una categoría",
                "VALIDACION"
            );
        }

        const imagenUrl = datos.imagenUrl?.trim() || null;

        if (imagenUrl && !/^https?:\/\//i.test(imagenUrl)) {
            throw new ErrorDominio(
                "IMAGEN_URL_INVALIDA",
                "La imagen debe ser una dirección http o https",
                "VALIDACION"
            );
        }

        return new Articulo(
            datos.id,
            nombre,
            descripcion,
            datos.estadoConservacion,
            datos.categoriaId,
            imagenUrl
        );
    }

    static reconstruir(datos: {
        id: string;
        nombre: string;
        descripcion: string;
        estadoConservacion: EstadoConservacion;
        categoriaId: string;
        imagenUrl: string | null;
    }): Articulo {

        return new Articulo(
            datos.id,
            datos.nombre,
            datos.descripcion,
            datos.estadoConservacion,
            datos.categoriaId,
            datos.imagenUrl
        );
    }

}
