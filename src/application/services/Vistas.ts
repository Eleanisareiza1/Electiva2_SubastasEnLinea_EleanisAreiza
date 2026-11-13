// Traduce las entidades del dominio a objetos planos para responder al cliente.
// Nunca incluye datos de contacto de los postores (RN-23): solo id y nombre.

import { OrdenPago } from "../../domain/OrdenPago";
import { Subasta } from "../../domain/Subasta";
import { Usuario } from "../../domain/Usuario";

export interface ContextoVista {
    nombresUsuarios: Map<string, string>;
    nombresCategorias: Map<string, string>;
}

export interface UsuarioVista {
    id: string;
    nombre: string;
    correo: string;
    fechaRegistro: string;
}

export interface OrdenPagoVista {
    id: string;
    subastaId: string;
    titulo: string;
    valor: number;
    estado: string;
    fechaEmision: string;
    fechaLimite: string;
    fechaPago: string | null;
}

export interface SubastaResumenVista {
    id: string;
    titulo: string;
    imagenUrl: string | null;
    categoriaId: string;
    categoriaNombre: string;
    estadoConservacion: string;
    estado: string;
    precioBase: number;
    incrementoMinimo: number;
    ofertaVigente: number | null;
    montoMinimoSiguiente: number;
    totalPujas: number;
    fechaPublicacion: string;
    fechaCierre: string;
    vendedorId: string;
    vendedorNombre: string;
    ganadorId: string | null;
    ganadorNombre: string | null;
}

export interface PujaVista {
    postorId: string;
    postorNombre: string;
    valor: number;
    fecha: string;
}

export interface SubastaDetalleVista extends SubastaResumenVista {
    descripcion: string;
    historial: PujaVista[];
    totalParticipantes: number;
    mejorPostorId: string | null;
    ordenPago: OrdenPagoVista | null;
}

const SIN_NOMBRE = "Usuario";

function nombreDe(contexto: ContextoVista, id: string | null): string | null {
    if (!id) {
        return null;
    }
    return contexto.nombresUsuarios.get(id) ?? SIN_NOMBRE;
}

export function aVistaUsuario(usuario: Usuario): UsuarioVista {
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo.obtenerValor(),
        fechaRegistro: usuario.fechaRegistro.toISOString()
    };
}

export function aVistaOrden(orden: OrdenPago, titulo: string): OrdenPagoVista {
    return {
        id: orden.id,
        subastaId: orden.subastaId,
        titulo,
        valor: orden.valor.obtenerValor(),
        estado: orden.obtenerEstado(),
        fechaEmision: orden.fechaEmision.toISOString(),
        fechaLimite: orden.fechaLimite.toISOString(),
        fechaPago: orden.obtenerFechaPago()?.toISOString() ?? null
    };
}

export function aVistaResumen(
    subasta: Subasta,
    contexto: ContextoVista
): SubastaResumenVista {

    const vigente = subasta.obtenerPujaVigente();

    return {
        id: subasta.id,
        titulo: subasta.articulo.nombre,
        imagenUrl: subasta.articulo.imagenUrl,
        categoriaId: subasta.articulo.categoriaId,
        categoriaNombre:
            contexto.nombresCategorias.get(subasta.articulo.categoriaId) ?? "Sin categoría",
        estadoConservacion: subasta.articulo.estadoConservacion,
        estado: subasta.obtenerEstado(),
        precioBase: subasta.precioBase.obtenerValor(),
        incrementoMinimo: subasta.incrementoMinimo.obtenerValor(),
        ofertaVigente: vigente ? vigente.valor.obtenerValor() : null,
        montoMinimoSiguiente: subasta.montoMinimoSiguiente(),
        totalPujas: subasta.obtenerPujas().length,
        fechaPublicacion: subasta.fechaPublicacion.toISOString(),
        fechaCierre: subasta.fechaCierre.toISOString(),
        vendedorId: subasta.vendedorId,
        vendedorNombre: nombreDe(contexto, subasta.vendedorId) ?? SIN_NOMBRE,
        ganadorId: subasta.obtenerGanadorId(),
        ganadorNombre: nombreDe(contexto, subasta.obtenerGanadorId())
    };
}

export function aVistaDetalle(
    subasta: Subasta,
    contexto: ContextoVista,
    usuarioActualId: string
): SubastaDetalleVista {

    const orden = subasta.obtenerOrdenPago();

    // La orden solo la ven el ganador y el vendedor.
    const puedeVerOrden =
        orden !== null &&
        (usuarioActualId === orden.ganadorId || usuarioActualId === subasta.vendedorId);

    const historial = subasta
        .obtenerPujas()
        .map((puja) => ({
            postorId: puja.postorId,
            postorNombre: nombreDe(contexto, puja.postorId) ?? SIN_NOMBRE,
            valor: puja.valor.obtenerValor(),
            fecha: puja.fecha.toISOString()
        }))
        .reverse();

    return {
        ...aVistaResumen(subasta, contexto),
        descripcion: subasta.articulo.descripcion,
        historial,
        totalParticipantes: subasta.obtenerParticipantesIds().length,
        mejorPostorId: subasta.obtenerPujaVigente()?.postorId ?? null,
        ordenPago: puedeVerOrden && orden ? aVistaOrden(orden, subasta.articulo.nombre) : null
    };
}
