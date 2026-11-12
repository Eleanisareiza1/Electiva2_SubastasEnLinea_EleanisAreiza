import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubastaService } from '../../../services/subasta.service';

@Component({
  selector: 'app-crear-subasta',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './crear-subasta.html',
  styleUrls: ['./crear-subasta.css']
})
export class CrearSubastaComponent {

  titulo = '';
  precioBase = 0;
  incrementoMinimo = 0;
  fechaCierre = '';

  constructor(
    private subastaService: SubastaService,
    private router: Router
  ) {}

  async crear() {

    await this.subastaService.crearSubasta(
      this.titulo,
      this.precioBase,
      this.incrementoMinimo,
      this.fechaCierre
    );

    this.router.navigate([
      '/subastas'
    ]);

  }

}