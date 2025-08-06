import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Public } from '../../services/public';
import { Auth } from '../../services/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  stats: any = {};
  cottages: any[] = [];
  searchForm: FormGroup;

  sortBy: string = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(
    private publicService: Public,
    public authService: Auth,
    private fb: FormBuilder,
  ) {
    this.searchForm = this.fb.group({
      name: [''],
      location: ['']
    })
  }

  ngOnInit(): void {
    this.publicService.getGeneralStats().subscribe(data => {
      this.stats = data;
    });
    this.loadCottages();
  }

  loadCottages(): void {
    const params = {
      ...this.searchForm.value,
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
}
