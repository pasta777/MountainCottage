import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { passwordRegex } from '../../validators/regex.validator';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if(password && confirmPassword && password.value !== confirmPassword.value) {
    return {passwordMissmatch: true};
  }

  return null;
}

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
      newPassword: ['', Validators.required, Validators.pattern(passwordRegex)],
      confirmPassword: ['', Validators.required]
    }, {validators: passwordMatchValidator});
  }

  onSubmit(): void {
    this.errorMessage = null;
    if(this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
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
