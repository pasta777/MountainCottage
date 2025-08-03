import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  selectedFile: File | null = null;
  registrationError: string | null = null;
  registrationSuccess: string | null = null;

  constructor(private fb: FormBuilder, private authService: Auth) {}

  ngOnInit(): void {
    const passwordRegex = /^(?=.*[A-Z])(?=(?:.*[a-z]){3})(?=.*\d)(?=.*[\W_]).{6,10}$/;

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.pattern(passwordRegex)]],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], // TODO
      creditCardNumber: ['', Validators.required],
      gender: ['M', Validators.required],
      userType: ['tourist', Validators.required],
      profilePicture: [null]
    });
  }

  onFileSelected(event: any): void {
    if(event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit(): void {
    this.registrationError = null;
    this.registrationSuccess = null;

    if(this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    Object.keys(this.registerForm.value).forEach(key => {
      formData.append(key, this.registerForm.value[key]);
    });

    if(this.selectedFile) {
      formData.append('profilePicture', this.selectedFile, this.selectedFile.name);
    }

    this.authService.register(formData).subscribe({
      next: (response) => {
        this.registrationSuccess = response.message;
        this.registerForm.reset();
      },
      error: (err) => {
        this.registrationError = err.error.message || 'Unknown error has occured.';
      }
    });
  }
}
