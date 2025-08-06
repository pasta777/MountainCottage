import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal {
  @Input() title: string = 'Default Title';

  @Output() closeEvent = new EventEmitter<void>();

  public isOpen = false;

  constructor() { }
  
  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.closeEvent.emit();
  }
}
