import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [JsonPipe, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent {

  usuario: any;

  constructor(
    private authService:
    AuthService
  ) {}

 async ngOnInit() {

  const response =
    await this.authService.profile();

  this.usuario =
    response.data;

}

}