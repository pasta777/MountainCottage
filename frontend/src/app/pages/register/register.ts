import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

export function luhnValidator(control: AbstractControl): ValidationErrors | null {
  let cardNumber = control.value as string;
  if(!cardNumber) {
    return null;
  }

  cardNumber = cardNumber.replace(/\s/g, '');

  let sum = 0;
  let shouldDouble = false;

  for(let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);

    if(shouldDouble) {
      digit *= 2;
      if(digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  if(sum % 10 === 0) {
    return null;
  } else {
    return {luhnInvalid: true};
  }
}

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

  detectedCardType: string | null = null;

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
      email: ['', [Validators.required, Validators.email]],
      creditCardNumber: ['', [Validators.required, luhnValidator]],
      gender: ['M', Validators.required],
      userType: ['tourist', Validators.required],
      profilePicture: [null]
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

    const visaPrefixes = ['4539', '4556', '4916', '4532', '4929', '4485', '4716'];
    if(visaPrefixes.some(prefix => cardNumber.startsWith(prefix)) && cardNumber.length == 16) {
      return 'visa';
    }

    return null;
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

  onCardNumberInput(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    const initialValue = inputElement.value;

    const sanitizedValue = initialValue.replace(/[^0-9\s]/g, '');

    this.registerForm.get('creditCardNumber')?.setValue(sanitizedValue, {emitEvent: false});
  }
}
