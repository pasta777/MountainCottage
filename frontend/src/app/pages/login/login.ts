import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { LoginForm } from '../../shared/login-form/login-form';

@Component({
  selector: 'app-login',
  imports: [CommonModule, LoginForm],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginError: string | null = null;

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  handleLogin(credentials: any): void {
    this.loginError = null;
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.loginError = err.error.message || "Login failed. Check the credentials.";
      }
    });
  }
}
