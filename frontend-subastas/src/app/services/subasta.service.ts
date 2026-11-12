import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubastaService {

  async obtenerSubastas() {

    const response =
      await axios.get(
        `${environment.apiUrl}/subastas`
      );

    return response.data;

  }

  async crearSubasta(
  titulo: string,
  precioBase: number,
  incrementoMinimo: number,
  fechaCierre: string
) {

  const response =
    await axios.post(

      `${environment.apiUrl}/subastas`,

      {
        vendedorId: 'eleanis@test.com',
        titulo,
        precioBase,
        incrementoMinimo,
        fechaCierre
      }

    );

  return response.data;

}

}

