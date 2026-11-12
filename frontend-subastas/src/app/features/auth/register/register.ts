import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService }
from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  nombre = '';
  correo = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async register() {

    try {

      await this.authService.register(
        this.nombre,
        this.correo,
        this.password
      );

      this.router.navigate([
        '/login'
      ]);

    } catch (error) {

      console.error(error);

    }

  }

}