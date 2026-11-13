import { HttpErrorResponse } from '@angular/common/http';
import { ErrorApi } from './modelos';

export interface ErrorMostrable {
  codigo: string;
  mensaje: string;
  detalles: string[];
}

// RF-25: convierte cualquier error HTTP en un mensaje comprensible para el usuario.
export function interpretarError(error: unknown): ErrorMostrable {

  if (error instanceof HttpErrorResponse) {

    if (error.status === 0) {
      return {
        codigo: 'SIN_CONEXION',
        mensaje: 'No hay conexión con el servidor. Verifica que la API esté encendida.',
        detalles: []
      };
    }

    const cuerpo = error.error as Partial<ErrorApi> | null;
    if (cuerpo && cuerpo.ok === false && cuerpo.error) {
      return {
        codigo: cuerpo.error.codigo,
        mensaje: cuerpo.error.mensaje,
        detalles: cuerpo.error.detalles ?? []
      };
    }

    return { codigo: `HTTP_${error.status}`, mensaje: 'El servidor respondió con un error inesperado.', detalles: [] };
  }

  return { codigo: 'ERROR', mensaje: 'Ocurrió un error inesperado.', detalles: [] };
}
