import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import { Cottage } from '../../services/cottage';
import { Review } from '../../services/review';
import { Reservation } from '../../services/reservation';
import { User } from '../../services/user';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-cottage-details',
  imports: [CommonModule, ReactiveFormsModule, LeafletModule],
  templateUrl: './cottage-details.html',
  styleUrls: ['./cottage-details.css', '../../../../node_modules/leaflet/dist/leaflet.css']
})
export class CottageDetails implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  cottage: any;
  reviews: any[] = [];
  map: L.Map | undefined;
  mapOptions: L.MapOptions;
  private resizeObserver: ResizeObserver | undefined;

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
    private fb: FormBuilder
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

    this.mapOptions = {
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '...'})
      ],
      zoom: 7,
      center: L.latLng(44.2, 21.0)
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if(id) {
      this.cottageService.getCottageById(id).subscribe(data => {
        this.cottage = data;
        this.setupMap();
      });
      this.reviewService.getReviewsForCottage(id).subscribe(data => {
        this.reviews = data;
      });
      this.userService.getProfile().subscribe(user => {
        this.reservationForm.patchValue({cardNumber: user.creditCardNumber});
      });
    }
  }

  onMapReady(map: L.Map) {
    this.map = map;
    this.setupMap();
  }

  setupMap(): void {
    if(this.cottage && this.map) {
      const coords = L.latLng(this.cottage.coordinates.lat, this.cottage.coordinates.lon);
      this.map.setView(coords, 13);
      L.marker(coords).addTo(this.map).bindPopup(this.cottage.name);

      this.resizeObserver = new ResizeObserver(() => {
        if(this.map) {
          this.map.invalidateSize();
        }
      });

      this.resizeObserver.observe(this.mapContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if(this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  nextStep(): void {
    if(this.reservationForm.get('startDate')?.valid && this.reservationForm.get('endDate')?.valid) {
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

    if(numOfNights > 0) {
      const pricePerNight = this.cottage.tariff.summer;
      this.fullPrice = numOfNights * pricePerNight;
    } else {
      this.fullPrice = 0;
    }
  }

  sendReservation(): void {
    if(this.reservationForm.invalid) return;
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
