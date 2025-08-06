import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from './services/auth';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Mountain Cottage';

  constructor(public authService: Auth, private router: Router) {
    this.authService.autoLogin();
  }

  getUserRole(): string | null {
    const token = this.authService.getActiveToken();
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
