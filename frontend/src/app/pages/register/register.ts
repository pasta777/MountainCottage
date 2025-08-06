import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { createPictureDimensionValidator } from '../../validators/image.validator';
import { passwordRegex } from '../../validators/regex.validator';
import { luhnValidator } from '../../validators/luhn.validator';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  registerForm!: FormGroup;
  selectedFile: File | null = null;
  registrationError: string | null = null;
  registrationSuccess: string | null = null;

  detectedCardType: string | null = null;

  constructor(private fb: FormBuilder, private authService: Auth) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.pattern(passwordRegex)]],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      creditCardNumber: ['', [Validators.required, luhnValidator]],
      gender: ['M', Validators.required],
      userType: ['tourist', Validators.required],
      profilePicture: [
        null,
        [],
        [createPictureDimensionValidator(100, 100, 300, 300)]
      ]
    });

    this.registerForm.get('creditCardNumber')?.valueChanges.subscribe(value => {
      if(value) {
        const cleanValue = value.replace(/\s/g, '');
        this.detectedCardType = this.detectCardType(cleanValue);
      } else {
        this.detectedCardType = null;
      }
    });
  }

  private detectCardType(cardNumber: string): string | null {
    const dinersPrefixes = ['300', '301', '302', '303', '36', '38'];
    if(dinersPrefixes.some(prefix => cardNumber.startsWith(prefix)) && cardNumber.length == 15) {
      return 'diners';
    }

    const mastercardPrefixes = ['51', '52', '53', '54', '55'];
    if(mastercardPrefixes.some(prefix => cardNumber.startsWith(prefix)) && cardNumber.length == 16) {
      return 'mastercard';
    }

    const visaPrefixes = ['4539', '4556', '4916', '4532', '4929', '4485', '4716', '4841'];
    if(visaPrefixes.some(prefix => cardNumber.startsWith(prefix)) && cardNumber.length == 16) {
      return 'visa';
    }

    return null;
  }

  onFileSelected(event: any): void {
    if(event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
      this.registerForm.get('profilePicture')?.setValue(file);
      this.registerForm.get('profilePicture')?.markAsTouched();
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
      if(key !== 'profilePicture') {
        formData.append(key, this.registerForm.value[key]);
      }
    });

    if(this.selectedFile) {
      formData.append('profilePicture', this.selectedFile, this.selectedFile.name);
    }

    this.authService.register(formData).subscribe({
      next: (response) => {
        this.registrationSuccess = response.message;
        this.registerForm.reset();
        this.fileInput.nativeElement.value = '';
        this.selectedFile = null;
      },
      error: (err) => {
        this.registrationError = err.error.message || 'Unknown error has occured.';
      }
    });
  }

  onCardNumberInput(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    const initialValue = inputElement.value;

    const sanitizedValue = initialValue.replace(/[^0-9\s]/g, '');

    this.detectCardType(sanitizedValue);

    this.registerForm.get('creditCardNumber')?.setValue(sanitizedValue, {emitEvent: false});
  }
}
