import { Component, computed, input } from '@angular/core';
import { EstadoSubasta } from '../../core/modelos';

const ETIQUETAS: Record<EstadoSubasta, string> = {
  ABIERTA: 'En vivo',
  CERRADA: 'Adjudicada',
  PAGADA: 'Pagada',
  DESIERTA: 'Desierta',
  CANCELADA: 'Cancelada',
  INCUMPLIDA: 'Incumplida'
};

@Component({
  selector: 'app-estado-subasta',
  templateUrl: './estado-subasta.html',
  styleUrl: './estado-subasta.css'
})
export class EstadoSubastaInsignia {
  readonly estado = input.required<EstadoSubasta>();
  readonly etiqueta = computed(() => ETIQUETAS[this.estado()]);
}
