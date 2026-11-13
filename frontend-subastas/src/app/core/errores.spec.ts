import { HttpErrorResponse } from '@angular/common/http';
import { PesosPipe } from '../compartido/pesos.pipe';
import { interpretarError } from './errores';

describe('interpretarError (RF-25)', () => {

  it('extrae el código y el mensaje del formato uniforme de la API', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: { ok: false, error: { codigo: 'RN-09', mensaje: 'La puja debe ser de al menos $5.000.000' } }
    });
    expect(interpretarError(error)).toEqual({
      codigo: 'RN-09',
      mensaje: 'La puja debe ser de al menos $5.000.000',
      detalles: []
    });
  });

  it('explica cuando no hay conexión con el servidor', () => {
    expect(interpretarError(new HttpErrorResponse({ status: 0 })).codigo).toBe('SIN_CONEXION');
  });

});

describe('PesosPipe (RN-21)', () => {

  it('muestra pesos colombianos sin decimales', () => {
    expect(new PesosPipe().transform(4800000)).toBe('$ 4.800.000');
    expect(new PesosPipe().transform(null)).toBe('—');
  });

});
