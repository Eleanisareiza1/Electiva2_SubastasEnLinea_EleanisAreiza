import { Pipe, PipeTransform } from '@angular/core';

const formato = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

// Pesos colombianos sin decimales (RN-21): 4800000 -> "$ 4.800.000".
@Pipe({ name: 'pesos' })
export class PesosPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return valor === null || valor === undefined ? '—' : `$ ${formato.format(valor)}`;
  }
}
