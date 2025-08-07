import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../services/user';
import { createPictureDimensionValidator } from '../../validators/image.validator';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { luhnValidator } from '../../validators/luhn.validator';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profileForm!: FormGroup;
  selectedFile: File | null = null;
  currentProfilePictureUrl: string | null = null;
  initialProfilePictureUrl: string | null = null;
  successMessage: string | null = null;
  private pictureStatusSubscription: Subscription | undefined;

  constructor(private fb: FormBuilder, private userService: User) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      creditCardNumber: ['', [Validators.required, luhnValidator]],
      profilePicture: [
        null,
        [],
        [createPictureDimensionValidator(100, 100, 300, 300)]
      ]
    });

    this.userService.getProfile().subscribe(user => {
      this.profileForm.patchValue({
        name: user.name,
        surname: user.surname,
        address: user.address,
        phoneNumber: user.phoneNumber,
        email: user.email,
        creditCardNumber: user.creditCardNumber
      });
      this.currentProfilePictureUrl = `http://localhost:3000/${user.profilePicture}`;
      this.initialProfilePictureUrl = `http://localhost:3000/${user.profilePicture}`;
    });

    this.pictureStatusSubscription = this.profileForm.get('profilePicture')?.statusChanges.subscribe(status => {
      if(status === 'VALID' && this.selectedFile) {
        const reader = new FileReader();
        reader.onload = () => {
          this.currentProfilePictureUrl = reader.result as string;
        };
        reader.readAsDataURL(this.selectedFile);
      } else if(status === 'INVALID') {
        this.currentProfilePictureUrl = this.initialProfilePictureUrl;
      }
    });
  }

  ngOnDestroy(): void {
    this.pictureStatusSubscription?.unsubscribe();
  }

  onFileSelected(event: any): void {
    if(event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
      this.profileForm.get('profilePicture')?.setValue(file);
      this.profileForm.get('profilePicture')?.markAllAsTouched();
    }
  }

  onSubmit(): void {
    if(this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.successMessage = null;

    const formData = new FormData();

    formData.append('name', this.profileForm.get('name')?.value);
    formData.append('surname', this.profileForm.get('surname')?.value);
    formData.append('address', this.profileForm.get('address')?.value);
    formData.append('phoneNumber', this.profileForm.get('phoneNumber')?.value);

    if(this.selectedFile && this.profileForm.get('profilePicture')?.valid) {
      formData.append('profilePicture', this.selectedFile);
    }

    this.userService.updateProfile(formData).subscribe(response => {
      this.successMessage = "The profile has been successfully updated.";
      if(response.profilePicture) {
        const newPictureUrl = `http://localhost:3000/${response.profilePicture}?${new Date().getTime()}`;
        this.currentProfilePictureUrl = newPictureUrl;
        this.initialProfilePictureUrl = newPictureUrl;
        this.profileForm.get('profilePicture')?.reset();
        this.selectedFile = null;
      }
    });

  }
}
