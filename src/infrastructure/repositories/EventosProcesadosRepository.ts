const eventos =
    new Set<string>();

export function yaProcesado(
    eventoId: string
): boolean {

    return eventos.has(
        eventoId
    );

}

export function registrarEvento(
    eventoId: string
): void {

    eventos.add(
        eventoId
    );

}