import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular'
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Reservation } from '../../services/reservation';
import { Modal } from '../../shared/modal/modal';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-owner-reservations',
  imports: [CommonModule, FullCalendarModule, Modal, ReactiveFormsModule],
  templateUrl: './owner-reservations.html',
  styleUrl: './owner-reservations.css'
})
export class OwnerReservations implements OnInit {
  @ViewChild(Modal) reservationModal!: Modal;

  allReservations: any[] = [];
  unresolvedReservations: any[] = [];
  selectedReservation: any = null;
  showDenyForm = false;
  denyForm: FormGroup;

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    weekends: true,
    events: [],
    eventClick: this.handleEventClick.bind(this),
  };

  constructor(private reservationService: Reservation, private fb: FormBuilder) {
    this.denyForm = this.fb.group({
      denyComment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.getMyReservationsOwner().subscribe(data => {
      this.allReservations = data;
      this.unresolvedReservations = data.filter(r => r.status === 'unresolved');
      this.mapToCalendarEvents(data);
    });
  }

  mapToCalendarEvents(reservations: any[]): void {
    this.calendarOptions.events = reservations.map(res => ({
      id: res._id,
      title: `${res.cottageId.name} - ${res.touristId.name} ${res.touristId.surname}`,
      start: res.startDate,
      end: res.endDate,
      color: res.status === 'approved' ? 'green' : (res.status === 'unresolved' ? 'orange' : 'grey')
    }));
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const reservation = this.allReservations.find(r => r._id === clickInfo.event.id);
    if(reservation && reservation.status === 'unresolved') {
      this.selectedReservation = reservation;
      this.showDenyForm = false;
      this.denyForm.reset();
      this.reservationModal.open();
    }
  }

  openDenyModal(reservation: any): void {
    this.selectedReservation = reservation;
    this.showDenyForm = true;
    this.denyForm.reset();
    this.reservationModal.open();
  }

  closeModal(): void {
    this.reservationModal.close();
    this.selectedReservation = null;
    this.showDenyForm = false;
  }

  onApprove(id: string): void {
    this.reservationService.approveReservation(id).subscribe(() => {
      this.loadReservations();
      if(this.reservationModal.isOpen) {
        this.closeModal();
      }
    });
  }

  onDenySubmit(): void {
    if(this.denyForm.invalid || !this.selectedReservation) return;

    const reason = this.denyForm.value.denyComment;
    this.reservationService.denyReservation(this.selectedReservation._id, reason).subscribe(() => {
      this.loadReservations();
      this.closeModal();
    });
  }
}
