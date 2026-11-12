import { Component } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { SubastaService } from '../../../services/subasta.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-subasta',
  standalone: true,
  templateUrl: './detalle-subasta.html',
  styleUrls: ['./detalle-subasta.css'],
  imports: [CommonModule]
})
export class DetalleSubastaComponent {
  subasta: any;

  constructor(
    private route: ActivatedRoute,

    private subastaService: SubastaService,
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    const response = await this.subastaService.obtenerSubastas();

    const subastas = response.data ?? response;

    this.subasta = subastas[Number(id)];
  }
}
