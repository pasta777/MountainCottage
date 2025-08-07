import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { LoginForm } from '../../shared/login-form/login-form';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, LoginForm],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {
  loginError: string | null = null;

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  handleAdminLogin(credentials: any): void {
    this.loginError = null;
    this.authService.adminLogin(credentials).subscribe({
      next: (response) => {
        this.router.navigate(['/admin/dashboard'])
      },
      error: (err) => {
        this.loginError = err.error.message || "Log In failed. Check the credentials.";
      }
    });
  }
}
