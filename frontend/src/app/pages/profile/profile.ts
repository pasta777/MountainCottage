import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../services/user';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profileForm!: FormGroup;
  selectedFile: File | null = null;
  currentProfilePictureUrl: string | null = null;
  successMessage: string | null = null;

  constructor(private fb: FormBuilder, private userService: User) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: [{value: '', disabled: true}],
      creditCardNumber: ['']
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
    });
  }

  onFileSelected(event: any): void {
    if(event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit(): void {
    if(this.profileForm.invalid) return;

    this.successMessage = null;

    const formData = new FormData();

    formData.append('name', this.profileForm.get('name')?.value);
    formData.append('surname', this.profileForm.get('surname')?.value);
    formData.append('address', this.profileForm.get('address')?.value);
    formData.append('phoneNumber', this.profileForm.get('phoneNumber')?.value);

    if(this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }

    this.userService.updateProfile(formData).subscribe(response => {
      this.successMessage = "The profile has been successfully updated.";
      if(response.profilePicture) {
        this.currentProfilePictureUrl = `http://localhost:3000/${response.profilePicture}?${new Date().getTime()}`;
      }
    });

  }
}
