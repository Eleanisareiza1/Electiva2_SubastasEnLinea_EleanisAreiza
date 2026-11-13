import { Component, computed, effect, inject, input, output } from '@angular/core';
import { RelojService } from './reloj.service';

function dosDigitos(n: number): string {
  return n.toString().padStart(2, '0');
}

// Píldora con el tiempo restante para el cierre; se pone roja en la última hora.
@Component({
  selector: 'app-cuenta-regresiva',
  template: `
    <span class="cuenta" [class.urgente]="urgente()" [class.terminada]="restanteMs() <= 0" [class.grande]="grande()">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></svg>
      {{ texto() }}
    </span>
  `,
  styles: `
    .cuenta { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 8px;
      border: 1.5px solid var(--gris-300); color: var(--texto-suave); font-weight: 700; font-size: 13px;
      font-variant-numeric: tabular-nums; background: #fff; white-space: nowrap; }
    .cuenta svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; }
    .urgente { border-color: var(--rojo); color: var(--rojo); background: #fff1f1; }
    .terminada { border-color: var(--gris-300); color: var(--texto-suave); background: var(--gris-100); }
    .grande { font-size: 22px; padding: 8px 14px; border-radius: 12px; }
    .grande svg { width: 22px; height: 22px; }
  `
})
export class CuentaRegresiva {

  private readonly reloj = inject(RelojService);

  readonly cierre = input.required<string>();
  readonly grande = input(false);
  readonly terminada = output<void>();

  readonly restanteMs = computed(() => new Date(this.cierre()).getTime() - this.reloj.ahora());
  readonly urgente = computed(() => this.restanteMs() > 0 && this.restanteMs() < 60 * 60 * 1000);

  readonly texto = computed(() => {
    const ms = this.restanteMs();
    if (ms <= 0) {
      return 'Finalizada';
    }
    const s = Math.floor(ms / 1000);
    const dias = Math.floor(s / 86400);
    const horas = Math.floor((s % 86400) / 3600);
    const minutos = Math.floor((s % 3600) / 60);
    const segundos = s % 60;
    if (dias > 0) {
      return `${dias}d ${horas}h ${dosDigitos(minutos)}m`;
    }
    return `${dosDigitos(horas)}:${dosDigitos(minutos)}:${dosDigitos(segundos)}`;
  });

  private avisada = false;

  constructor() {
    effect(() => {
      if (this.restanteMs() <= 0 && !this.avisada) {
        this.avisada = true;
        this.terminada.emit();
      }
    });
  }
}
