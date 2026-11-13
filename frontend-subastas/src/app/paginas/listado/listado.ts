import { Component, DestroyRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AlertaError } from '../../compartido/alerta-error/alerta-error';
import { CuentaRegresiva } from '../../compartido/cuenta-regresiva/cuenta-regresiva';
import { EstadoSubastaInsignia } from '../../compartido/estado-subasta/estado-subasta';
import { ImagenArticulo } from '../../compartido/imagen-articulo/imagen-articulo';
import { PesosPipe } from '../../compartido/pipes/pesos.pipe';
import { ErrorMostrable, interpretarError } from '../../core/errores';
import { Categoria, ESTADOS_CONSERVACION, ESTADOS_SUBASTA, Listado as ListadoApi, Perfil, SubastaResumen } from '../../core/modelos';
import { NotificacionesService } from '../../core/servicios/notificaciones.service';
import { SesionService } from '../../core/servicios/sesion.service';
import { SubastasService } from '../../core/servicios/subastas.service';
import { TiempoRealService } from '../../core/servicios/tiempo-real.service';

const TAMANO_PAGINA = 8;

// RF-22 y RF-05: listado con filtros por categoría y estado, búsqueda y paginación.
// Las ofertas se actualizan en vivo por WebSocket.
@Component({
  selector: 'app-listado',
  imports: [RouterLink, PesosPipe, CuentaRegresiva, EstadoSubastaInsignia, ImagenArticulo, AlertaError],
  templateUrl: './listado.html',
  styleUrl: './listado.css'
})
export class Listado implements OnInit, OnDestroy {

  private readonly api = inject(SubastasService);
  private readonly tiempoReal = inject(TiempoRealService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destruir = inject(DestroyRef);
  readonly sesion = inject(SesionService);
  readonly notificaciones = inject(NotificacionesService);

  readonly estados = ESTADOS_SUBASTA;
  readonly categorias = signal<Categoria[]>([]);
  readonly listado = signal<ListadoApi | null>(null);
  readonly destacadas = signal<SubastaResumen[]>([]);
  readonly perfil = signal<Perfil | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<ErrorMostrable | null>(null);
  readonly resaltadas = signal<Set<string>>(new Set());

  readonly filtroEstado = signal<string>('');
  readonly filtroCategoria = signal<string>('');
  readonly texto = signal<string>('');
  readonly pagina = signal(1);

  readonly hayFiltros = computed(() => !!(this.filtroEstado() || this.filtroCategoria() || this.texto()));
  readonly totalTodas = computed(() =>
    Object.values(this.listado()?.conteoPorEstado ?? {}).reduce((a, b) => a + (b ?? 0), 0)
  );
  readonly paginas = computed(() => Array.from({ length: this.listado()?.totalPaginas ?? 1 }, (_, i) => i + 1));
  readonly liderando = computed(() =>
    (this.perfil()?.participadas ?? []).filter((s) => s.estado === 'ABIERTA').slice(0, 4)
  );

  ngOnInit(): void {
    void this.api.categorias().then((c) => this.categorias.set(c)).catch(() => undefined);
    void this.cargarLateral();

    this.ruta.queryParamMap.pipe(takeUntilDestroyed(this.destruir)).subscribe((params) => {
      this.filtroEstado.set(params.get('estado') ?? '');
      this.filtroCategoria.set(params.get('categoria') ?? '');
      this.texto.set(params.get('texto') ?? '');
      this.pagina.set(Number(params.get('pagina') ?? 1) || 1);
      void this.cargar();
    });

    // Tiempo real: las ofertas y estados cambian sin recargar (RF-24).
    this.tiempoReal.suscribirListado();
    this.tiempoReal.nuevaPuja$.pipe(takeUntilDestroyed(this.destruir)).subscribe((e) => {
      const actualizar = (s: SubastaResumen): SubastaResumen =>
        s.id === e.subastaId
          ? { ...s, ofertaVigente: e.valor, totalPujas: e.totalPujas, montoMinimoSiguiente: e.montoMinimoSiguiente }
          : s;
      this.listado.update((l) => (l ? { ...l, items: l.items.map(actualizar) } : l));
      this.destacadas.update((d) => d.map(actualizar));
      this.resaltar(e.subastaId);
    });
    this.tiempoReal.cambioEstado$.pipe(takeUntilDestroyed(this.destruir)).subscribe((e) => {
      const actualizar = (s: SubastaResumen): SubastaResumen =>
        s.id === e.subastaId ? { ...s, estado: e.estado, ganadorNombre: e.ganadorNombre } : s;
      this.listado.update((l) => (l ? { ...l, items: l.items.map(actualizar) } : l));
      this.destacadas.update((d) => d.map(actualizar).filter((s) => s.estado === 'ABIERTA'));
      void this.cargarLateral();
    });
  }

  ngOnDestroy(): void {
    this.tiempoReal.desuscribirListado();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const [listado, destacadas] = await Promise.all([
        this.api.listar({
          estado: this.filtroEstado() || undefined,
          categoria: this.filtroCategoria() || undefined,
          texto: this.texto() || undefined,
          pagina: this.pagina(),
          tamano: TAMANO_PAGINA
        }),
        this.hayFiltros() ? Promise.resolve(null) : this.api.listar({ estado: 'ABIERTA', tamano: 4 })
      ]);
      this.listado.set(listado);
      if (destacadas) {
        this.destacadas.set(destacadas.items);
      }
    } catch (e) {
      this.error.set(interpretarError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarLateral(): Promise<void> {
    try {
      this.perfil.set(await this.api.perfil());
    } catch {
      this.perfil.set(null);
    }
  }

  // Cuando una cuenta regresiva llega a cero se vuelve a consultar: la API cierra la subasta (cierre perezoso).
  alTerminar(): void {
    setTimeout(() => void this.cargar(), 1200);
  }

  filtrar(cambios: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      relativeTo: this.ruta,
      queryParams: { pagina: null, ...cambios },
      queryParamsHandling: 'merge'
    });
  }

  limpiar(): void {
    void this.router.navigate([], { relativeTo: this.ruta, queryParams: {} });
  }

  conservacion(valor: string): string {
    return ESTADOS_CONSERVACION.find((e) => e.valor === valor)?.etiqueta ?? valor;
  }

  conteo(estado: string): number {
    return this.listado()?.conteoPorEstado[estado as keyof ApiConteo] ?? 0;
  }

  private resaltar(id: string): void {
    this.resaltadas.update((s) => new Set(s).add(id));
    setTimeout(() => this.resaltadas.update((s) => { const n = new Set(s); n.delete(id); return n; }), 1600);
  }
}

type ApiConteo = ListadoApi['conteoPorEstado'];
