import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';
import { Cottage } from '../../services/cottage';
import { Review } from '../../services/review';
import { Reservation } from '../../services/reservation';
import { User } from '../../services/user';
import { Lightbox, LightboxModule } from 'ngx-lightbox'
import { Auth } from '../../services/auth';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-cottage-details',
  imports: [CommonModule, ReactiveFormsModule, LeafletModule, LightboxModule],
  templateUrl: './cottage-details.html',
  styleUrls: ['./cottage-details.css']
})
export class CottageDetails implements OnInit {
  cottage: any;
  reviews: any[] = [];
  map: L.Map | undefined;

  album: any[] = [];

  isTourist: boolean = false;
  
  mapOptions: L.MapOptions = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      })
    ],
    zoom: 7,
    center: L.latLng(44.2, 21.0)
  };

  reservationForm: FormGroup;
  currentStep = 1;
  fullPrice = 0;
  reservationError: string | null = null;
  reservationSuccess: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private cottageService: Cottage,
    private reviewService: Review,
    private reservationService: Reservation,
    private userService: User,
    private fb: FormBuilder,
    private lightbox: Lightbox,
    private authService: Auth
  ) {
    this.reservationForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      numOfPersons: this.fb.group({
        adults: [1, [Validators.required, Validators.min(1)]],
        children: [0, Validators.required]
      }),
      cardNumber: ['', Validators.required],
      additionalRequests: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    this.isTourist = this.authService.getUserRole() === 'tourist';

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cottageService.getCottageById(id).subscribe(data => {
        this.cottage = data;
        if (this.map) {
          this.setupMapMarker();
        }
        if(data.pictures && data.pictures.length > 0) {
          this.album = data.pictures.map((picture: string) => {
            return {
              src: `http://localhost:3000/${picture}`,
              caption: data.name,
              thumb: `http://localhost:3000/${picture}`
            }
          });
        }
      });
      this.reviewService.getReviewsForCottage(id).subscribe(data => {
        this.reviews = data;
      });
      this.userService.getProfile().subscribe(user => {
        this.reservationForm.patchValue({ cardNumber: user.creditCardNumber });
      });
    }
  }

  openLightbox(index: number): void {
    this.lightbox.open(this.album, index);
  }
  
  onMapReady(map: L.Map): void {
    this.map = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 0);
    
    if (this.cottage) {
      this.setupMapMarker();
    }
  }
  
  setupMapMarker(): void {
    if (!this.map || !this.cottage) {
      return;
    }

    const coords = L.latLng(this.cottage.coordinates.lat, this.cottage.coordinates.lon);

    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.map.setView(coords, 13);
    L.marker(coords, { icon: customIcon }).addTo(this.map).bindPopup(this.cottage.name);
  }

  nextStep(): void {
    if (this.reservationForm.get('startDate')?.valid && this.reservationForm.get('endDate')?.valid) {
      this.calculatePrice();
      this.currentStep = 2;
    }
  }

  lastStep(): void {
    this.currentStep = 1;
  }

  calculatePrice(): void {
    const start = new Date(this.reservationForm.value.startDate);
    const end = new Date(this.reservationForm.value.endDate);
    const numOfNights = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

    if (numOfNights > 0 && this.cottage) {
      const startMonth = start.getMonth();

      const isWinter = startMonth >= 9 || startMonth <= 2;

      const pricePerNight = isWinter ? this.cottage.tariff.winter : this.cottage.tariff.summer;

      this.fullPrice = pricePerNight * numOfNights;
    } else {
      this.fullPrice = 0;
    }
  }

  sendReservation(): void {
    if (this.reservationForm.invalid) return;
    this.reservationError = null;
    this.reservationSuccess = null;

    const data = {
      cottageId: this.cottage._id,
      ...this.reservationForm.value
    };

    this.reservationService.createReservation(data).subscribe({
      next: () => {
        this.reservationSuccess = "Your reservation has been successfully sent and is waiting for owner's approval.";
        this.currentStep = 1;
        this.reservationForm.reset();
      },
      error: (err) => {
        this.reservationError = err.error.message || "An error has occured.";
      }
    });
  }
}