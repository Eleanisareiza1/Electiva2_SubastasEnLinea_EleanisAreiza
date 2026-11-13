import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Categoria,
  IntentoFallido,
  Listado,
  OrdenPago,
  Perfil,
  RespuestaApi,
  SubastaDetalle,
  SubastaResumen
} from '../modelos';

export interface FiltrosListado {
  categoria?: string;
  estado?: string;
  texto?: string;
  pagina?: number;
  tamano?: number;
}

export interface DatosPublicacion {
  nombre: string;
  descripcion: string;
  estadoConservacion: string;
  categoriaId: string;
  imagenUrl: string | null;
  precioBase: number;
  incrementoMinimo: number;
  fechaCierre: string;
}

// Consumo de la API REST: el cliente pregunta y el servidor responde.
@Injectable({ providedIn: 'root' })
export class SubastasService {

  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  private obtener<T>(ruta: string, params?: HttpParams): Promise<T> {
    return firstValueFrom(this.http.get<RespuestaApi<T>>(`${this.api}${ruta}`, { params }).pipe(map((r) => r.data)));
  }

  categorias(): Promise<Categoria[]> {
    return this.obtener<Categoria[]>('/categorias');
  }

  listar(filtros: FiltrosListado): Promise<Listado> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    }
    return this.obtener<Listado>('/subastas', params);
  }

  detalle(id: string): Promise<SubastaDetalle> {
    return this.obtener<SubastaDetalle>(`/subastas/${id}`);
  }

  intentosFallidos(id: string): Promise<IntentoFallido[]> {
    return this.obtener<IntentoFallido[]>(`/subastas/${id}/intentos-fallidos`);
  }

  perfil(): Promise<Perfil> {
    return this.obtener<Perfil>('/auth/profile');
  }

  ordenes(): Promise<OrdenPago[]> {
    return this.obtener<OrdenPago[]>('/ordenes');
  }

  publicar(datos: DatosPublicacion): Promise<SubastaResumen> {
    return firstValueFrom(
      this.http.post<RespuestaApi<SubastaResumen>>(`${this.api}/subastas`, datos).pipe(map((r) => r.data))
    );
  }

  pujar(id: string, valor: number): Promise<{ valor: number; montoMinimoSiguiente: number }> {
    return firstValueFrom(
      this.http
        .post<RespuestaApi<{ valor: number; montoMinimoSiguiente: number }>>(`${this.api}/subastas/${id}/pujas`, { valor })
        .pipe(map((r) => r.data))
    );
  }

  cancelar(id: string): Promise<void> {
    return firstValueFrom(this.http.patch<void>(`${this.api}/subastas/${id}/cancelar`, {}));
  }
}
