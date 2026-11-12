import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  correo = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async login() {

    try {

      await this.authService.login(
        this.correo,
        this.password
      );

      this.router.navigate([
        '/profile'
      ]);

    } catch (error) {

      console.error(error);

    }

  }

}