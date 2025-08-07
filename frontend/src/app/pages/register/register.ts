import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { createPictureDimensionValidator } from '../../validators/image.validator';
import { passwordRegex } from '../../validators/regex.validator';
import { luhnValidator } from '../../validators/luhn.validator';
import { UserForm } from '../../shared/user-form/user-form';

@Component({
  selector: 'app-register',
  imports: [CommonModule, UserForm],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registrationError: string | null = null;
  registrationSuccess: string | null = null;

  constructor(private authService: Auth) {}

  onRegister(formData: FormData) {
    this.registrationError = null;
    this.registrationSuccess = null;

    this.authService.register(formData).subscribe({
        next: (response) => {
          this.registrationSuccess = response.message;
        },
        error: (err) => {
          this.registrationError = err.error.message || "An unknown error occurred.";
        }
    });
  }
  
}
