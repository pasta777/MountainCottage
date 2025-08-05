import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Public } from '../../services/public';

@Component({
  selector: 'app-cottages',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cottages.html',
  styleUrl: './cottages.css'
})
export class Cottages implements OnInit {
  cottages: any[] = [];
  searchForm: FormGroup;

  sortBy: string = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(private publicService: Public, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      name: [''],
      location: ['']
    });
  }

  ngOnInit(): void {
    this.loadCottages();
  }

  loadCottages(): void {
    const params = {
      name: this.searchForm.value.name,
      location: this.searchForm.value.location,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };
    this.publicService.getCottages(params).subscribe(data => {
      this.cottages = data;
    });
  }

  onSearch(): void {
    this.loadCottages();
  }

  onSort(column: string): void {
    if(this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.loadCottages();
  }

  getStarRating(rating: number): string[] {
    const stars = [];
    const roundedRating = Math.round(rating);
    for(let i = 1; i <= 5; i++) {
      if(i <= roundedRating) {
        stars.push('★');
      } else {
        stars.push('☆');
      }
    }
    return stars;
  }
}
