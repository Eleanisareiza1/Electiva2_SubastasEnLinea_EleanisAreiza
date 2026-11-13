import { Component, input } from '@angular/core';
import { ErrorMostrable } from '../core/errores';

// RF-25: muestra el código y el mensaje del error devuelto por la API.
@Component({
  selector: 'app-alerta-error',
  template: `
    @if (error(); as e) {
      <div class="alerta" role="alert">
        <span class="codigo">{{ e.codigo }}</span>
        <div>
          <strong>{{ e.mensaje }}</strong>
          @if (e.detalles.length) {
            <ul>
              @for (d of e.detalles; track d) { <li>{{ d }}</li> }
            </ul>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .alerta { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; border-radius: 10px;
      background: #fff1f1; border: 1px solid #fecaca; color: #991b1b; font-size: 14px; }
    .codigo { flex: none; font-size: 11px; font-weight: 800; background: var(--rojo); color: #fff; padding: 3px 7px; border-radius: 6px; }
    ul { margin: 6px 0 0; padding-left: 18px; }
  `
})
export class AlertaError {
  readonly error = input<ErrorMostrable | null>(null);
}
