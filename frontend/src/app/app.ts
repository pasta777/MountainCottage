import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from './services/auth';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Mountain Cottage';

  constructor(public authService: Auth, private router: Router) {}

  getUserRole(): string | null {
    const token = this.authService.getToken() || this.authService.getAdminToken();
    if(!token) {
      return null;
    }
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.userType;
    } catch(error) {
      return null;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
