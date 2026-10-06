// Representa una oferta realizada por un usuario
// dentro de una subasta.

// Declara y exporta la clase Puja.
// "export" permite utilizar esta clase desde otros archivos.
import { Dinero } from "./valueObjects/Dinero";
export class Puja {

    // Almacena el identificador del usuario que realizó la puja.
    // "public" permite acceder a esta propiedad desde fuera de la clase.
    // "readonly" impide modificarla después de asignarla.
    public readonly usuarioId: string;

    // Almacena el valor ofrecido en la puja.
    // Es público y no puede modificarse después de su creación.
    public readonly valor: Dinero;

    // Almacena la fecha y hora en que se realizó la puja.
    // Es pública y no puede modificarse posteriormente.
    public readonly fecha: Date;

    // Constructor utilizado para crear una nueva puja.
    constructor(
        // Recibe el identificador del usuario que realiza la oferta.
        usuarioId: string,

        // Recibe el valor monetario de la oferta.
        valor: Dinero
    ) {

        // Guarda el identificador del usuario en la propiedad usuarioId.
        this.usuarioId = usuarioId;

        // Guarda el valor de la oferta en la propiedad valor.
        this.valor = valor;

        // Registra automáticamente la fecha y hora actual.
        this.fecha = new Date();
    }

// Cierra la definición de la clase Puja.
}