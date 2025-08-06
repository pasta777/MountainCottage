import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Admin } from '../../services/admin';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { luhnValidator } from '../register/register';

@Component({
  selector: 'app-admin-users-management',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './admin-users-management.html',
  styleUrl: './admin-users-management.css'
})
export class AdminUsersManagement implements OnInit {
  users: any[] = [];
  isModalOpen = false;
  addUserForm!: FormGroup;

  constructor(private adminService: Admin, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadUsers();

    const passwordRegex = /^(?=.*[A-Z])(?=(?:.*[a-z]){3})(?=.*\d)(?=.*[\W_]).{6,10}$/;

    this.addUserForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      username: ['', Validators.required, Validators.minLength(3)],
      password: ['', Validators.required, Validators.pattern(passwordRegex)],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.required, Validators.email, luhnValidator],
      creditCardNumber: ['', Validators.required],
      gender: ['M', Validators.required],
      userType: ['tourist', Validators.required]
    });
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe(data => {
      this.users = data;
    });
  }

  openAddUserModal(): void {
    this.isModalOpen = true;
    this.addUserForm.reset({gender: 'M', userType: 'tourist'});
  }

  closeAddUserModal(): void {
    this.isModalOpen = false;
  }

  onAddNewUser(): void {
    if(this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      return;
    }

    this.adminService.createUser(this.addUserForm.value).subscribe({
        next: () => {
          alert("User successfully created!");
          this.loadUsers();
          this.closeAddUserModal();
        },
        error: (err) => {
          alert(err.error.message || "An error has occured.");
        }
    });
  }

  onToggleStatus(id: string): void {
    this.adminService.toggleUserStatus(id).subscribe(() => {
      const user = this.users.find(u => u._id === id);
      if(user) {
        user.status = user.status === 'active' ? 'inactive' : 'active';
      }
    });
  }

  onDelete(id: string): void {
    if(confirm("Are you sure you want to permanently remove this user and all data related to user?")) {
      this.adminService.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(u => u._id !== id);
      });
    }
  }

}
