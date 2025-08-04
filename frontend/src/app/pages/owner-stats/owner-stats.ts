import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Stats } from '../../services/stats';

@Component({
  selector: 'app-owner-stats',
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './owner-stats.html',
  styleUrl: './owner-stats.css'
})
export class OwnerStats implements OnInit {
  barChartData: any[] = [];

  view: [number, number] = [700, 400];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Month';
  showYAxisLabel = true;
  yAxisLabel = 'Number of Reservations';

  constructor(private statsService: Stats) {}

  ngOnInit(): void {
    this.statsService.getOwnerStats().subscribe(data => {
      this.formatBarChartData(data.reservationsByMonth);
    });
  }

  formatBarChartData(apiData: any[]): void {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const groupedData: {[key: string]: {name: string, series: any[]}} = {};

    apiData.forEach(item => {
      const cottageName = item.cottageName;
      if(!groupedData[cottageName]) {
        groupedData[cottageName] = {name: cottageName, series: []};
      }
      groupedData[cottageName].series.push({
        name: `${months[item.month - 1]} ${item.year}`,
        value: item.numOfReservations,
      });
    });

    this.barChartData = Object.values(groupedData);
  }
}
