import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AlertaError } from '../../compartido/alerta-error';
import { CuentaRegresiva } from '../../compartido/cuenta-regresiva';
import { PesosPipe } from '../../compartido/pesos.pipe';
import { ErrorMostrable, interpretarError } from '../../core/errores';
import { OrdenPago } from '../../core/modelos';
import { SubastasService } from '../../core/servicios/subastas.service';

// RF-17: el ganador consulta sus órdenes de pago y paga en la pasarela externa.
@Component({
  selector: 'app-ordenes',
  imports: [RouterLink, DatePipe, PesosPipe, CuentaRegresiva, AlertaError],
  templateUrl: './ordenes.html',
  styleUrl: './ordenes.css'
})
export class Ordenes implements OnInit {

  private readonly api = inject(SubastasService);

  readonly ordenes = signal<OrdenPago[] | null>(null);
  readonly error = signal<ErrorMostrable | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      this.ordenes.set(await this.api.ordenes());
    } catch (e) {
      this.error.set(interpretarError(e));
    }
  }

  urlPago(orden: OrdenPago): string {
    const params = new URLSearchParams({
      ordenId: orden.id,
      valor: String(orden.valor),
      titulo: orden.titulo,
      retorno: `${location.origin}/ordenes`
    });
    return `${environment.pasarelaUrl}?${params.toString()}`;
  }
}
