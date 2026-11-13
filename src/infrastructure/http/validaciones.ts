// Validación de FORMATO en el borde HTTP. Las reglas de negocio no se validan
// aquí: las decide el dominio (RNF-03).

export class ErrorFormato extends Error {
    constructor(public readonly detalles: string[]) {
        super("La solicitud tiene datos con formato inválido");
        this.name = "ErrorFormato";
    }
}

type Cuerpo = Record<string, unknown>;

export class LectorCuerpo {

    private readonly errores: string[] = [];
    private readonly cuerpo: Cuerpo;

    constructor(cuerpo: unknown) {
        this.cuerpo = typeof cuerpo === "object" && cuerpo !== null ? (cuerpo as Cuerpo) : {};
    }

    texto(campo: string, opciones: { opcional?: boolean; max?: number } = {}): string {
        const valor = this.cuerpo[campo];
        if (valor === undefined || valor === null || valor === "") {
            if (!opciones.opcional) {
                this.errores.push(`"${campo}" es obligatorio`);
            }
            return "";
        }
        if (typeof valor !== "string") {
            this.errores.push(`"${campo}" debe ser texto`);
            return "";
        }
        if (opciones.max && valor.length > opciones.max) {
            this.errores.push(`"${campo}" admite máximo ${opciones.max} caracteres`);
        }
        return valor;
    }

    numero(campo: string): number {
        const valor = this.cuerpo[campo];
        if (typeof valor !== "number" || !Number.isFinite(valor)) {
            this.errores.push(`"${campo}" debe ser un número`);
            return NaN;
        }
        return valor;
    }

    fecha(campo: string): Date {
        const valor = this.cuerpo[campo];
        const fecha = typeof valor === "string" ? new Date(valor) : new Date(NaN);
        if (isNaN(fecha.getTime())) {
            this.errores.push(`"${campo}" debe ser una fecha ISO 8601 (por ejemplo 2026-11-20T18:00:00-05:00)`);
        }
        return fecha;
    }

    // Lanza ErrorFormato si algún campo falló.
    verificar(): void {
        if (this.errores.length > 0) {
            throw new ErrorFormato(this.errores);
        }
    }

}

export function enteroPositivo(valor: unknown, porDefecto: number, maximo: number): number {
    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero < 1) {
        return porDefecto;
    }
    return Math.min(numero, maximo);
}
