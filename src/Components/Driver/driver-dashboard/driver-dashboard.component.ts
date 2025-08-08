import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AvailabilityStatusService } from '../../../Services/Driver/availability-status.service';
interface IStatistics {
  icon: string;
  title: string;
  total: number;
  color: string;
}

@Component({
  standalone: true,
  selector: 'app-driver-dashboard',
  imports: [CommonModule],
  templateUrl: './driver-dashboard.component.html',
  styleUrls: ['./driver-dashboard.component.css']
})
export class DriverDashboardComponent implements OnInit{
  availablityStatus: string = 'Available';
  statistics: IStatistics[] = [
    {
      icon: "fa-solid fa-dollar-sign",
      title: "Today's Earnings",
      total: 245,
      color: "money-icon"
    },
    {
      icon: "fas fa-chart-line",
      title: "This Week",
      total: 1680,
      color: "services-icon"
    },
    {
      icon: "fas fa-chart-line",
      title: "This Month",
      total: 6420,
      color: "loyalty-icon"
    },
    {
      icon: "fa-solid fa-toolbox",
      title: "Total Jobs",
      total: 340,
      color: "member-icon"
    }
  ];
  
  constructor(private availabilityService: AvailabilityStatusService) {}

  ngOnInit(): void {
    this.availabilityService.availabilityStatus$.subscribe(status => {
      this.availablityStatus = status;
    });
  }

  onStatusChange(event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value;
    this.availabilityService.setAvailability(newStatus);
  }
}
