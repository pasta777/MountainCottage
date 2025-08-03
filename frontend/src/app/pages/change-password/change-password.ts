import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword implements OnInit {
  changePasswordForm!: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: Auth) {}

  ngOnInit(): void {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if(this.changePasswordForm.invalid) {
      return;
    }

    const passwordData = {
      oldPassword: this.changePasswordForm.value.oldPassword,
      newPassword: this.changePasswordForm.value.newPassword,
    };

    this.authService.changePassword(passwordData).subscribe({
      next: (response) => {
        alert("Password is changed successfully! You will be redirected to login page.");
        this.authService.logout();
      },
      error: (err) => {
        this.errorMessage = err.error.message || "An error has occured.";
      }
    });
  }
}
