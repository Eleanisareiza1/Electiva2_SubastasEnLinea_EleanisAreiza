import { Component, computed, effect, inject, input, output } from '@angular/core';
import { RelojService } from '../servicios/reloj.service';

function dosDigitos(n: number): string {
  return n.toString().padStart(2, '0');
}

// Píldora con el tiempo restante para el cierre; se pone roja en la última hora.
@Component({
  selector: 'app-cuenta-regresiva',
  templateUrl: './cuenta-regresiva.html',
  styleUrl: './cuenta-regresiva.css'
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
