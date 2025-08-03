import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin implements OnInit {
  loginForm!: FormGroup;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if(this.loginForm.invalid) {
      return;
    }
    this.loginError = null;
    this.authService.adminLogin(this.loginForm.value).subscribe({
      next: (response) => {
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loginError = err.error.message || 'Log in failed. Check the credentials.'
      }
    })
  }
}
