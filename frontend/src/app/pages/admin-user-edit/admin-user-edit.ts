import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Admin } from '../../services/admin';
import { UserForm } from '../../shared/user-form/user-form';

@Component({
  selector: 'app-admin-user-edit',
  imports: [CommonModule, UserForm],
  templateUrl: './admin-user-edit.html',
  styleUrl: './admin-user-edit.css'
})
export class AdminUserEdit implements OnInit {
  user: any;
  userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: Admin
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if(this.userId) {
      this.adminService.getUserById(this.userId).subscribe(user => {
        this.user = user;
      });
    }
  }

  onUserUpdate(formData: FormData): void {
    if(!this.userId) return;

    this.adminService.updateUser(this.userId, formData).subscribe(() => {
      alert("The user is updated successfully.");
      this.router.navigate(['/admin/users']);
    });
  }
}
