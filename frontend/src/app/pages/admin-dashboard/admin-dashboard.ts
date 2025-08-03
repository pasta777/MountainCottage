import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Admin } from '../../services/admin';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  requests: any[] = [];

  constructor(private adminService: Admin) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.adminService.getRegistrationRequests().subscribe(data => {
      this.requests = data;
    });
  }

  onApprove(userId: string): void {
    this.adminService.approveRequest(userId).subscribe(() => {
      this.requests = this.requests.filter(req => req._id !== userId);
    });
  }

  onReject(userId: string): void {
    this.adminService.rejectRequest(userId).subscribe(() => {
      this.requests = this.requests.filter(req => req._id !== userId);
    });
  }
}
