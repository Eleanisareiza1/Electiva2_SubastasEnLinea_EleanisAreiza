// Implementaciones en memoria de los puertos de persistencia.
// Permiten ejecutar la API sin base de datos (PERSISTENCIA=memoria) y
// demuestran que la persistencia se sustituye sin tocar dominio ni aplicación (RNF-06).

import { Categoria } from "../../../domain/Categoria";
import { EventoPago } from "../../../domain/EventoPago";
import { Notificacion } from "../../../domain/Notificacion";
import { Subasta } from "../../../domain/Subasta";
import { Usuario } from "../../../domain/Usuario";
import { ErrorDominio } from "../../../domain/errors/ErrorDominio";
import { CategoriaRepository } from "../../../domain/repositories/CategoriaRepository";
import { EventoPagoRepository } from "../../../domain/repositories/EventoPagoRepository";
import { NotificacionRepository } from "../../../domain/repositories/NotificacionRepository";
import {
    FiltrosSubasta,
    PaginaSubastas,
    SubastaRepository
} from "../../../domain/repositories/SubastaRepository";
import { UsuarioRepository } from "../../../domain/repositories/UsuarioRepository";
import { Correo } from "../../../domain/valueObjects/Correo";
import { EstadoPago } from "../../../domain/valueObjects/EstadoPago";
import { EstadoSubasta } from "../../../domain/valueObjects/EstadoSubasta";
import { CATEGORIAS_INICIALES } from "../categoriasIniciales";

export function ordenarSubastas(lista: Subasta[], estado?: EstadoSubasta): Subasta[] {
    const copia = [...lista];
    if (estado === EstadoSubasta.ABIERTA) {
        return copia.sort((a, b) => a.fechaCierre.getTime() - b.fechaCierre.getTime());
    }
    return copia.sort((a, b) => b.fechaPublicacion.getTime() - a.fechaPublicacion.getTime());
}

export class MemoriaSubastaRepository implements SubastaRepository {

    private readonly subastas = new Map<string, Subasta>();

    async guardar(subasta: Subasta): Promise<void> {
        this.subastas.set(subasta.id, subasta);
    }

    async buscarPorId(id: string): Promise<Subasta | null> {
        return this.subastas.get(id) ?? null;
    }

    async buscarPorOrdenPagoId(ordenId: string): Promise<Subasta | null> {
        return this.todas().find((s) => s.obtenerOrdenPago()?.id === ordenId) ?? null;
    }

    async buscar(filtros: FiltrosSubasta): Promise<PaginaSubastas> {

        const texto = filtros.texto?.toLowerCase();

        const filtradas = this.todas().filter((s) =>
            (!filtros.categoriaId || s.articulo.categoriaId === filtros.categoriaId) &&
            (!filtros.estado || s.obtenerEstado() === filtros.estado) &&
            (!texto ||
                s.articulo.nombre.toLowerCase().includes(texto) ||
                s.articulo.descripcion.toLowerCase().includes(texto))
        );

        const inicio = (filtros.pagina - 1) * filtros.tamanoPagina;

        return {
            items: ordenarSubastas(filtradas, filtros.estado).slice(inicio, inicio + filtros.tamanoPagina),
            total: filtradas.length
        };
    }

    async contarPorEstado(categoriaId?: string): Promise<Record<string, number>> {
        const conteo: Record<string, number> = {};
        for (const s of this.todas()) {
            if (!categoriaId || s.articulo.categoriaId === categoriaId) {
                conteo[s.obtenerEstado()] = (conteo[s.obtenerEstado()] ?? 0) + 1;
            }
        }
        return conteo;
    }

    async buscarPendientesDeSincronizar(ahora: Date): Promise<Subasta[]> {
        return this.todas().filter((s) =>
            (s.obtenerEstado() === EstadoSubasta.ABIERTA && s.plazoTerminado(ahora)) ||
            (s.obtenerEstado() === EstadoSubasta.CERRADA &&
                s.obtenerOrdenPago()?.obtenerEstado() === EstadoPago.PENDIENTE &&
                s.obtenerOrdenPago()!.plazoVencido(ahora))
        );
    }

    async buscarPorVendedor(vendedorId: string): Promise<Subasta[]> {
        return ordenarSubastas(this.todas().filter((s) => s.vendedorId === vendedorId));
    }

    async buscarPorParticipante(postorId: string): Promise<Subasta[]> {
        return ordenarSubastas(
            this.todas().filter((s) => s.obtenerParticipantesIds().includes(postorId))
        );
    }

    async buscarPorGanador(ganadorId: string): Promise<Subasta[]> {
        return this.todas().filter((s) => s.obtenerGanadorId() === ganadorId);
    }

    private todas(): Subasta[] {
        return [...this.subastas.values()];
    }

}

export class MemoriaUsuarioRepository implements UsuarioRepository {

    private readonly usuarios = new Map<string, Usuario>();

    async guardar(usuario: Usuario): Promise<void> {
        const existente = await this.buscarPorCorreo(usuario.correo);
        if (existente && existente.id !== usuario.id) {
            throw new ErrorDominio("RN-22", "Ya existe un usuario registrado con ese correo", "CONFLICTO");
        }
        this.usuarios.set(usuario.id, usuario);
    }

    async buscarPorId(id: string): Promise<Usuario | null> {
        return this.usuarios.get(id) ?? null;
    }

    async buscarPorCorreo(correo: Correo): Promise<Usuario | null> {
        return [...this.usuarios.values()].find((u) => u.correo.esIgualA(correo)) ?? null;
    }

    async buscarPorIds(ids: string[]): Promise<Usuario[]> {
        return ids.map((id) => this.usuarios.get(id)).filter((u): u is Usuario => u !== undefined);
    }

}

export class MemoriaCategoriaRepository implements CategoriaRepository {

    private readonly categorias: Categoria[] = [...CATEGORIAS_INICIALES];

    async obtenerTodas(): Promise<Categoria[]> {
        return [...this.categorias];
    }

    async buscarPorId(id: string): Promise<Categoria | null> {
        return this.categorias.find((c) => c.id === id) ?? null;
    }

}

export class MemoriaEventoPagoRepository implements EventoPagoRepository {

    private readonly eventos = new Map<string, EventoPago>();

    async buscarPorId(eventoId: string): Promise<EventoPago | null> {
        return this.eventos.get(eventoId) ?? null;
    }

    async guardar(evento: EventoPago): Promise<void> {
        this.eventos.set(evento.id, evento);
    }

}

export class MemoriaNotificacionRepository implements NotificacionRepository {

    private readonly notificaciones = new Map<string, Notificacion>();

    async guardar(notificacion: Notificacion): Promise<void> {
        this.notificaciones.set(notificacion.id, notificacion);
    }

    async buscarPorId(id: string): Promise<Notificacion | null> {
        return this.notificaciones.get(id) ?? null;
    }

    async buscarPorUsuario(usuarioId: string, limite: number): Promise<Notificacion[]> {
        return [...this.notificaciones.values()]
            .filter((n) => n.usuarioId === usuarioId)
            .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
            .slice(0, limite);
    }

}
