import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Admin } from '../../services/admin';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordRegex } from '../../validators/regex.validator';
import { luhnValidator } from '../../validators/luhn.validator';
import { Modal } from '../../shared/modal/modal';
import { UserForm } from '../../shared/user-form/user-form';

@Component({
  selector: 'app-admin-users-management',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, Modal, UserForm],
  templateUrl: './admin-users-management.html',
  styleUrl: './admin-users-management.css'
})
export class AdminUsersManagement implements OnInit {
  @ViewChild(Modal) addUserModal!: Modal;

  users: any[] = [];
  addUserForm!: FormGroup;

  constructor(private adminService: Admin) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe(data => {
      this.users = data;
    });
  }

  openAddUserModal(): void {
    this.addUserModal.open();
  }

  closeAddUserModal(): void {
    this.addUserModal.close();
  }

  onAddNewUser(): void {
    alert("User successfully created!");
    this.loadUsers();
    this.closeAddUserModal();
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
