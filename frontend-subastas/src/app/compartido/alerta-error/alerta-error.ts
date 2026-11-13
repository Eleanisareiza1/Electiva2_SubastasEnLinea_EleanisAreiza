import { Component, input } from '@angular/core';
import { ErrorMostrable } from '../../core/errores';

// RF-25: muestra el código y el mensaje del error devuelto por la API.
@Component({
  selector: 'app-alerta-error',
  templateUrl: './alerta-error.html',
  styleUrl: './alerta-error.css'
})
export class AlertaError {
  readonly error = input<ErrorMostrable | null>(null);
}
