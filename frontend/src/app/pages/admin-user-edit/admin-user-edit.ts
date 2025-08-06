import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Admin } from '../../services/admin';

@Component({
  selector: 'app-admin-user-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-user-edit.html',
  styleUrl: './admin-user-edit.css'
})
export class AdminUserEdit implements OnInit {
  editForm!: FormGroup;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: Admin
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required]
    });

    this.userId = this.route.snapshot.paramMap.get('id');
    if(this.userId) {
      this.adminService.getUserById(this.userId).subscribe(user => {
        this.editForm.patchValue({
          name: user.name,
          surname: user.surname,
          address: user.address,
          phoneNumber: user.phoneNumber
        });
      });
    }
  }

  onSubmit(): void {
    if(this.editForm.invalid || !this.userId) {
      return;
    }
    this.adminService.updateUser(this.userId, this.editForm.value).subscribe(() => {
      alert("The user is updated successfully.");
      this.router.navigate(['/admin/users']);
    });
  }
}
