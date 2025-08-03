import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Api } from './services/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');

  constructor(private apiService: Api) {}

  ngOnInit(): void {
    this.apiService.getTestMessage().subscribe(data => {
      console.log('Message from the server: ', data);
    });
  }
}
