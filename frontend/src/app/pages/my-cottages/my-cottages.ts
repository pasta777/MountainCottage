import { Component, OnInit } from '@angular/core';
import { Cottage } from '../../services/cottage';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-cottages',
  imports: [CommonModule, RouterModule],
  templateUrl: './my-cottages.html',
  styleUrl: './my-cottages.css'
})
export class MyCottages implements OnInit {
  myCottages: any[] = [];

  constructor(private cottageService: Cottage) {}

  ngOnInit(): void {
    this.loadCottages();
  }

  loadCottages(): void {
    this.cottageService.getMyCottages().subscribe(data => {
      this.myCottages = data;
    });
  }

  onDelete(id: string): void {
    if(confirm("Are you sure you want to delete this cottage?")) {
      this.cottageService.deleteCottage(id).subscribe(() => {
        this.loadCottages();
      });
    }
  }
}
