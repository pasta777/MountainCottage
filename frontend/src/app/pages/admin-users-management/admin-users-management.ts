import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Admin } from '../../services/admin';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-users-management',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-users-management.html',
  styleUrl: './admin-users-management.css'
})
export class AdminUsersManagement implements OnInit {
  users: any[] = [];

  constructor(private adminService: Admin) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe(data => {
      this.users = data;
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
