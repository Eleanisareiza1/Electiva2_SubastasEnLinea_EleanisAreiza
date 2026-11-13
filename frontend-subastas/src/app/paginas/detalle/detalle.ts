import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnDestroy, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AlertaError } from '../../compartido/alerta-error/alerta-error';
import { CuentaRegresiva } from '../../compartido/cuenta-regresiva/cuenta-regresiva';
import { EstadoSubastaInsignia } from '../../compartido/estado-subasta/estado-subasta';
import { ImagenArticulo } from '../../compartido/imagen-articulo/imagen-articulo';
import { PesosPipe } from '../../compartido/pipes/pesos.pipe';
import { ErrorMostrable, interpretarError } from '../../core/errores';
import { ESTADOS_CONSERVACION, IntentoFallido, SubastaDetalle } from '../../core/modelos';
import { AvisosService } from '../../core/servicios/avisos.service';
import { SesionService } from '../../core/servicios/sesion.service';
import { SubastasService } from '../../core/servicios/subastas.service';
import { TiempoRealService } from '../../core/servicios/tiempo-real.service';

// RF-06, RF-23, RF-24 y RF-25: detalle que se actualiza en tiempo real,
// formulario de puja y errores de la API mostrados de forma comprensible.
@Component({
  selector: 'app-detalle',
  imports: [FormsModule, RouterLink, DatePipe, PesosPipe, CuentaRegresiva, EstadoSubastaInsignia, ImagenArticulo, AlertaError],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css'
})
export class Detalle implements OnDestroy {

  private readonly api = inject(SubastasService);
  private readonly tiempoReal = inject(TiempoRealService);
  private readonly avisos = inject(AvisosService);
  private readonly destruir = inject(DestroyRef);
  readonly sesion = inject(SesionService);

  readonly id = input.required<string>();

  readonly subasta = signal<SubastaDetalle | null>(null);
  readonly cargando = signal(true);
  readonly errorCarga = signal<ErrorMostrable | null>(null);
  readonly errorPuja = signal<ErrorMostrable | null>(null);
  readonly enviando = signal(false);
  readonly monto = signal<number | null>(null);
  readonly conectados = signal(0);
  readonly nuevaPujaClave = signal<string | null>(null);
  readonly intentos = signal<IntentoFallido[] | null>(null);
  readonly mensajeCierre = signal<string | null>(null);

  readonly miId = computed(() => this.sesion.usuario()?.id ?? null);
  readonly soyVendedor = computed(() => this.subasta()?.vendedorId === this.miId());
  readonly soyLider = computed(() => !!this.subasta() && this.subasta()!.mejorPostorId === this.miId());
  readonly abierta = computed(() => this.subasta()?.estado === 'ABIERTA');
  readonly puedePujar = computed(() => this.abierta() && !this.soyVendedor());
  readonly urlPago = computed(() => {
    const s = this.subasta();
    const orden = s?.ordenPago;
    if (!s || !orden || orden.estado !== 'PENDIENTE' || s.ganadorId !== this.miId()) {
      return null;
    }
    const params = new URLSearchParams({
      ordenId: orden.id,
      valor: String(orden.valor),
      titulo: s.titulo,
      retorno: `${location.origin}/subastas/${s.id}`
    });
    return `${environment.pasarelaUrl}?${params.toString()}`;
  });

  private suscritoA: string | null = null;

  constructor() {
    // Cada vez que cambia el id de la ruta se carga y se suscribe a esa subasta (RF-12).
    effect(() => {
      const id = this.id();
      if (this.suscritoA && this.suscritoA !== id) {
        this.tiempoReal.desuscribirSubasta(this.suscritoA);
      }
      this.suscritoA = id;
      this.tiempoReal.suscribirSubasta(id);
      void this.cargar(true);
    });

    this.tiempoReal.nuevaPuja$.pipe(takeUntilDestroyed(this.destruir)).subscribe((e) => {
      const actual = this.subasta();
      if (!actual || e.subastaId !== actual.id) {
        return;
      }
      const yaEstaba = actual.historial.some((p) => p.fecha === e.fecha && p.valor === e.valor);
      this.subasta.set({
        ...actual,
        ofertaVigente: e.valor,
        montoMinimoSiguiente: e.montoMinimoSiguiente,
        totalPujas: e.totalPujas,
        mejorPostorId: e.postorId,
        totalParticipantes: actual.historial.some((p) => p.postorId === e.postorId)
          ? actual.totalParticipantes
          : actual.totalParticipantes + 1,
        historial: yaEstaba
          ? actual.historial
          : [{ postorId: e.postorId, postorNombre: e.postorNombre, valor: e.valor, fecha: e.fecha }, ...actual.historial]
      });
      if ((this.monto() ?? 0) < e.montoMinimoSiguiente) {
        this.monto.set(e.montoMinimoSiguiente);
      }
      this.nuevaPujaClave.set(e.fecha);
    });

    this.tiempoReal.cambioEstado$.pipe(takeUntilDestroyed(this.destruir)).subscribe((e) => {
      if (e.subastaId === this.subasta()?.id) {
        this.mensajeCierre.set(e.mensaje);
        void this.cargar(false);
      }
    });

    this.tiempoReal.participantes$.pipe(takeUntilDestroyed(this.destruir)).subscribe((e) => {
      if (e.subastaId === this.id()) {
        this.conectados.set(e.cantidad);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.suscritoA) {
      this.tiempoReal.desuscribirSubasta(this.suscritoA);
    }
  }

  async cargar(inicial: boolean): Promise<void> {
    if (inicial) {
      this.cargando.set(true);
      this.subasta.set(null);
      this.intentos.set(null);
      this.mensajeCierre.set(null);
    }
    this.errorCarga.set(null);
    try {
      const detalle = await this.api.detalle(this.id());
      this.subasta.set(detalle);
      if (inicial || (this.monto() ?? 0) < detalle.montoMinimoSiguiente) {
        this.monto.set(detalle.montoMinimoSiguiente);
      }
      if (this.intentos() !== null) {
        void this.verIntentos();
      }
    } catch (e) {
      this.errorCarga.set(interpretarError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  // El plazo terminó en pantalla: al consultar, la API aplica el cierre perezoso.
  alTerminar(): void {
    setTimeout(() => void this.cargar(false), 1000);
  }

  sumar(veces: number): void {
    const s = this.subasta();
    if (s) {
      this.monto.set(s.montoMinimoSiguiente + s.incrementoMinimo * veces);
    }
  }

  async pujar(): Promise<void> {
    const s = this.subasta();
    const valor = this.monto();
    if (!s || valor === null) {
      return;
    }
    this.errorPuja.set(null);
    this.enviando.set(true);
    try {
      // La puja viaja por HTTP: necesita una respuesta directa (aceptada o rechazada).
      await this.api.pujar(s.id, valor);
      this.avisos.mostrar('¡Tu puja fue aceptada! Ahora eres el mejor postor.', 'exito');
    } catch (e) {
      const error = interpretarError(e);
      this.errorPuja.set(error);
      this.avisos.mostrar(`Puja rechazada (${error.codigo})`, 'error');
      if (this.intentos() !== null) {
        void this.verIntentos();
      }
    } finally {
      this.enviando.set(false);
    }
  }

  async cancelar(): Promise<void> {
    const s = this.subasta();
    if (!s || !confirm('¿Cancelar esta subasta? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      await this.api.cancelar(s.id);
      this.avisos.mostrar('La subasta fue cancelada.', 'info');
      await this.cargar(false);
    } catch (e) {
      const error = interpretarError(e);
      this.avisos.mostrar(`${error.codigo}: ${error.mensaje}`, 'error');
    }
  }

  async verIntentos(): Promise<void> {
    try {
      this.intentos.set(await this.api.intentosFallidos(this.id()));
    } catch (e) {
      this.avisos.mostrar(interpretarError(e).mensaje, 'error');
    }
  }

  conservacion(valor: string): string {
    return ESTADOS_CONSERVACION.find((e) => e.valor === valor)?.etiqueta ?? valor;
  }
}
