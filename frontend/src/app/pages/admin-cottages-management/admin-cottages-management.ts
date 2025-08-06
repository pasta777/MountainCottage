import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Admin } from '../../services/admin';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-cottages-management',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-cottages-management.html',
  styleUrl: './admin-cottages-management.css'
})
export class AdminCottagesManagement implements OnInit {
  cottages: any[] = [];

  constructor(private adminService: Admin) {}

  ngOnInit(): void {
    this.loadCottages();
  }

  loadCottages(): void {
    this.adminService.getAllCottages().subscribe(data => {
      this.cottages = data;
    });
  }

  onBlock(id: string): void {
    if(confirm("Are you sure you want to block this cottage for 48 hours?")) {
      this.adminService.blockCottage(id).subscribe(response => {
        alert(response.message);
        this.loadCottages();
      });
    }
  }

  isBlocked(cottage: any): boolean {
    if(!cottage.blockedUntil) return false;
    return new Date(cottage.blockedUntil) > new Date();
  }
}
