import { Component, inject } from '@angular/core';
import { AvisosService } from '../../core/servicios/avisos.service';

@Component({
  selector: 'app-avisos',
  templateUrl: './avisos.html',
  styleUrl: './avisos.css'
})
export class Avisos {
  readonly servicio = inject(AvisosService);
}
