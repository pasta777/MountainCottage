import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Admin } from '../../services/admin';
import { passwordRegex } from '../../validators/regex.validator';
import { luhnValidator } from '../../validators/luhn.validator';
import { Subscription } from 'rxjs';
import { createPictureDimensionValidator } from '../../validators/image.validator';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserForm implements OnInit, OnChanges {
  @Input() user: any;
  @Input() editMode = false;
  @Input() isProfilePage = false;
  @Output() formSubmit = new EventEmitter<FormData>();

  userForm!: FormGroup;
  selectedFile: File | null = null;
  detectedCardType: string | null = null;
  profilePicturePreview: string | null = null;
  private pictureStatusSubscription: Subscription | undefined;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.handlePictureChanges();
    this.handleCardType();

    if(this.user) {
      this.patchFormValues();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.userForm && changes['user'] && changes['user'].currentValue) {
      this.patchFormValues();
    }
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      username: [{value: '', disabled: this.isProfilePage}, [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.pattern(passwordRegex)]],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      creditCardNumber: ['', [Validators.required, Validators.minLength(15), Validators.maxLength(16), luhnValidator]],
      gender: ['M', Validators.required],
      userType: ['tourist', Validators.required],
      profilePicture: [null, [], [createPictureDimensionValidator(100, 100, 300, 300)]],
    }); 
  }

  private patchFormValues(): void {
    const userToPatch = { ...this.user };

    delete userToPatch.password;

    this.userForm.patchValue(userToPatch);
    if(this.user.profilePicture) {
      this.profilePicturePreview = `http://localhost:3000/${this.user.profilePicture}`;
    }
  }

  private handlePictureChanges(): void {
    this.pictureStatusSubscription = this.userForm.get('profilePicture')?.statusChanges.subscribe(status => {
      if(status === 'VALID' && this.selectedFile) {
        const reader = new FileReader();
        reader.onload = () => { this.profilePicturePreview = reader.result as string; };
        reader.readAsDataURL(this.selectedFile);
      }
    });
  }

    private handleCardType(): void {
    this.userForm.get('creditCardNumber')?.valueChanges.subscribe(value => {
      this.detectedCardType = value ? this.detectCardType(value) : null;
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

  onCardNumberInput(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    const sanitizedValue = inputElement.value.replace(/[^0-9\s]/g, '');

    this.userForm.get('creditCardNumber')?.setValue(sanitizedValue, {emitEvent: false});
    this.detectedCardType = this.detectCardType(sanitizedValue);
  }

  onFileSelected(event: any): void {
    if(event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
      this.userForm.get('profilePicture')?.setValue(file);
      this.userForm.get('profilePicture')?.markAsTouched();
    }
  }

  onSubmit(): void {
    if(this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    const formData = new FormData();
    Object.keys(this.userForm.value).forEach(key => {
      if(key !== 'profilePicture') {
        formData.append(key, this.userForm.get(key)?.value);
      }
    });

    if(this.selectedFile) {
      formData.append('profilePicture', this.selectedFile, this.selectedFile.name);
    }

    this.formSubmit.emit(formData);
  }


}
