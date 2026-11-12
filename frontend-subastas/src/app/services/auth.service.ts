import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  async login(
    correo: string,
    password: string
  ) {

    const response =
      await axios.post(

        `${environment.apiUrl}/auth/login`,

        {
          correo,
          password
        }

      );

    const token =
      response.data.token;

    localStorage.setItem(
      'token',
      token
    );

    return response.data;
  }

  async register(
    nombre: string,
    correo: string,
    password: string
  ) {

    const response =
      await axios.post(

        `${environment.apiUrl}/auth/register`,

        {
          nombre,
          correo,
          password
        }

      );

    return response.data;
  }

  async profile() {

    const token =
      localStorage.getItem(
        'token'
      );

    const response =
      await axios.get(

        `${environment.apiUrl}/auth/profile`,

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }

      );

    return response.data;

  }

}