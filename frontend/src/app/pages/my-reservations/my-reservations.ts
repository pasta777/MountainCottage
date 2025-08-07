import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Reservation } from '../../services/reservation';
import { Review } from '../../services/review';
import { Modal } from '../../shared/modal/modal';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-reservations',
  imports: [CommonModule, ReactiveFormsModule, Modal, RouterLink],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.css'
})
export class MyReservations implements OnInit {
  @ViewChild(Modal) reviewModal!: Modal;

  currentReservations: any[] = [];
  reservationsArchive: any[] = [];

  formForReview: FormGroup;
  reservationForReview: any = null;

  constructor(
    private reservationService: Reservation,
    private reviewService: Review,
    private fb: FormBuilder
  ) {
    this.formForReview = this.fb.group({
      rating: [5, Validators.required],
      comment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.getMyReservationsTourist().subscribe(data => {
      const today = new Date();
      this.currentReservations = data.filter(r => new Date(r.endDate) >= today && r.status !== 'canceled' && r.status !== 'denied');
      this.reservationsArchive = data.filter(r => new Date(r.endDate) < today || r.status === 'canceled' || r.status === 'denied');
    });
  }

  onCancel(id: string): void {
    if(confirm("Are you sure you want to cancel this reservation?")) {
      this.reservationService.cancelReservation(id).subscribe({
          next: () => {
            alert("Reservation canceled successfully");
            this.loadReservations();
          },
          error: (err) => {
            alert(err.error.message || "An error has occured.");
          }
      });
    }
  }

  openFormForReview(reservation: any): void {
    this.reservationForReview = reservation;
    this.formForReview.reset({rating: 5, comment: ''});
    this.reviewModal.open();
  }

  closeFormForReview(): void {
    this.reviewModal.close();
  }

  onSendReview(): void {
    if(this.formForReview.invalid || !this.reservationForReview) {
      return;
    }
    const data = {
      cottageId: this.reservationForReview.cottageId._id,
      reservationId: this.reservationForReview._id,
      ...this.formForReview.value,
    }
    this.reviewService.addReview(data).subscribe(() => {
      alert("Thanks for the review!");
      const index = this.reservationsArchive.findIndex(r => r._id === this.reservationForReview._id);
      if(index !== -1) {
        this.reservationsArchive[index].isReviewed = true;
      }
      this.reservationForReview = null;
      this.closeFormForReview();
    });
  }

  canCancel(reservation: any): boolean {
    const today = new Date();
    const dayBeforeStart = new Date(new Date(reservation.startDate).getTime() - (24 * 60 * 60 * 1000));
    return today <= dayBeforeStart;
  }

  isPastDate(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }
}
