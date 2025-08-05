import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular'
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Reservation } from '../../services/reservation';

@Component({
  selector: 'app-owner-reservations',
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './owner-reservations.html',
  styleUrl: './owner-reservations.css'
})
export class OwnerReservations implements OnInit {
  allReservations: any[] = [];
  unresolvedReservations: any[] = [];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    weekends: true,
    events: [],
    eventClick: this.handleEventClick.bind(this),
  };

  constructor(private reservationService: Reservation) {}

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
      if(confirm(`Do you want to approve reservation for cottage "${reservation.cottageId.name}"?`)) {
        this.onApprove(reservation._id);
      } else {
        const comment = prompt("Enter the reason for denying:");
        if(comment) {
          this.onDeny(reservation._id, comment);
        }
      }
    }
  }

  onApprove(id: string): void {
    this.reservationService.approveReservation(id).subscribe(() => {
      this.loadReservations();
    });
  }

  onDeny(id: string, comment?: string): void {
    const reason = comment || prompt("Enter the reason for denying:");
    if(reason) {
      this.reservationService.denyReservation(id, reason).subscribe(() => {
        this.loadReservations();
      });
    }
  }
}
