import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {SubastaService} from '../../../services/subasta.service';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-listado-subastas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listado-subastas.html',
  styleUrls: ['./listado-subastas.css']
})
export class ListadoSubastasComponent {

  subastas: any[] = [];

  constructor(
    private subastaService:
    SubastaService
  ) {}

  async ngOnInit() {

    const response =
      await this.subastaService
      .obtenerSubastas();

    this.subastas =
      response.data ??
      response;

  }

}