import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../services/user';
import { createPictureDimensionValidator } from '../../validators/image.validator';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { luhnValidator } from '../../validators/luhn.validator';
import { UserForm } from "../../shared/user-form/user-form";

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UserForm],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: any;
  successMessage: string | null = null;

  constructor(private userService: User) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe(userData => {
      this.user = userData;
    });
  }

  onProfileUpdate(formData: FormData): void {
    this.successMessage = null;
    this.userService.updateProfile(formData).subscribe(response => {
      this.successMessage = "The profile has been successfully updated!";
      if(response.profilePicture) {
        this.user = {...this.user, profilePicture: response.profilePicture};
      }
    });
  }
}
