import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Cottage } from '../../services/cottage';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cottage-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cottage-form.html',
  styleUrl: './cottage-form.css'
})
export class CottageForm implements OnInit {
  cottageForm!: FormGroup;
  editMode = false;
  private cottageId: string | null = null;
  selectedFiles: File[] = [];
  existingPictures: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cottageService: Cottage
  ) {}

  ngOnInit(): void {
    this.cottageForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      services: ['', Validators.required],
      summerTariff: ['', Validators.required],
      winterTariff: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      lat: ['', Validators.required],
      lon: ['', Validators.required]
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if(id) {
        this.editMode = true;
        this.cottageId = id;
        this.loadCottageData(id);
      }
    });
  }

  loadCottageData(id: string): void {
    this.cottageService.getCottageById(id).subscribe(data => {
      this.cottageForm.patchValue({
        name: data.name,
        location: data.location,
        services: data.services,
        summerTariff: data.tariff.summer,
        winterTariff: data.tariff.winter,
        phoneNumber: data.phoneNumber,
        lat: data.coordinates.lat,
        lon: data.coordinates.lon
      });
      this.existingPictures = data.pictures;
    });
  }

  onDeletePicture(picturePath: string): void {
    if(confirm("Are you sure you want to delete this picture?") && this.cottageId) {
      this.cottageService.deletePicture(this.cottageId, picturePath).subscribe(response => {
        this.existingPictures = response.pictures;
      });
    }
  }

  onJsonFileSelected(event: any): void {
    const file = event.target.files[0];
    if(!file) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const result = e.target?.result;
        if(typeof result === 'string') {
          const data = JSON.parse(result);
          this.cottageForm.patchValue(data);
          alert("Data from JSON file has been successfully loaded into form.");
        }
      } catch(error) {
        console.error("Error while reading JSON file: ", error);
        alert("An error has occured. Check if JSON file is formatted correctly.");
      }
    };
    fileReader.readAsText(file);
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  onSubmit(): void {
    if(this.cottageForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.cottageForm.value.name);
    formData.append('location', this.cottageForm.value.location);
    formData.append('services', this.cottageForm.value.services);
    formData.append('tariff[summer]', this.cottageForm.value.summerTariff);
    formData.append('tariff[winter]', this.cottageForm.value.winterTariff);
    formData.append('phoneNumber', this.cottageForm.value.phoneNumber);
    formData.append('coordinates[lat]', this.cottageForm.value.lat);
    formData.append('coordinates[lon]', this.cottageForm.value.lon);

    this.selectedFiles.forEach(file => {
      formData.append('pictures', file);
    });

    if(this.editMode && this.cottageId) {
      this.cottageService.updateCottage(this.cottageId, formData).subscribe(() => {
        this.router.navigate(['/my-cottages']);
      });
    } else {
      this.cottageService.createCottage(formData).subscribe(() => {
        this.router.navigate(['/my-cottages']);
      });
    }
  }
}
