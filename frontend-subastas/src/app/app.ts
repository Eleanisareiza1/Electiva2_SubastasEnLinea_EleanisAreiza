import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Avisos } from './compartido/avisos/avisos';
import { Encabezado } from './diseno/encabezado/encabezado';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Encabezado, Avisos],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
