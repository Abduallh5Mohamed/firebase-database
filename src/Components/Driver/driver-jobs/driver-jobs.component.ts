import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverSharedComponent } from '../driver-shared/driver-shared.component';

interface ITripStatus {
  driverName: string,
  status: string,
  salary: string,
  destination: string,
  from: string,
  to: string,
  requestTime: string,
  ago: string,
  rating: string
}

@Component({
  selector: 'app-driver-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-jobs.component.html',
  styleUrl: './driver-jobs.component.css'
})
export class DriverJobsComponent {
  isNavbarCollapsed = true;

  tripStatus: ITripStatus[] = [
    {
      driverName: "Sarah Johnson",
      status: "completed",
      salary: "24.50",
      destination: "8.2 km",
      from: "123 Main St, Downtown",
      to: "456 Ork Ave, Uptown",
      requestTime: "10:30 AM",
      ago: "25 min",
      rating: "5/5"
    },
    {
      driverName: "Mike Chen",
      status: "completed",
      salary: "38.75",
      destination: "15.6 km",
      from: "789 Pine St, Midtown",
      to: "Airport Terminal B",
      requestTime: "2:15 PM",
      ago: "35 min",
      rating: "4/5"
    },
    {
      driverName: "Emily Davis",
      status: "active",
      salary: "19.25",
      destination: "6.4 km",
      from: "321 Elm St, Westdown",
      to: "654 Maple Dr, Eastside",
      requestTime: "Now",
      ago: "18 min",
      rating: "5/5"
    },
    {
      driverName: "James Lee",
      status: "completed",
      salary: "27.90",
      destination: "10.1 km",
      from: "234 Oak St, Lakeside",
      to: "876 River Rd, Baytown",
      requestTime: "11:45 AM",
      ago: "40 min",
      rating: "4/5"
    },
    {
      driverName: "Linda Nguyen",
      status: "active",
      salary: "22.00",
      destination: "7.5 km",
      from: "567 Birch Ave, Southview",
      to: "321 Palm Blvd, Northpoint",
      requestTime: "Now",
      ago: "12 min",
      rating: "5/5"
    },
    {
      driverName: "Carlos Romero",
      status: "completed",
      salary: "31.40",
      destination: "12.8 km",
      from: "789 Cedar Rd, Westbridge",
      to: "159 Ivy Ln, Hillcrest",
      requestTime: "1:05 PM",
      ago: "50 min",
      rating: "3/5"
    },
    {
      driverName: "Ava Patel",
      status: "completed",
      salary: "29.00",
      destination: "9.3 km",
      from: "123 Spruce Ct, Midtown",
      to: "456 Rose St, Eastvale",
      requestTime: "12:30 PM",
      ago: "20 min",
      rating: "4/5"
    },
    {
      driverName: "Daniel Kim",
      status: "active",
      salary: "17.80",
      destination: "5.2 km",
      from: "765 Chestnut Blvd, Oldtown",
      to: "134 Willow Dr, Newtown",
      requestTime: "Now",
      ago: "8 min",
      rating: "5/5"
    },
    {
      driverName: "Sophia Garcia",
      status: "completed",
      salary: "33.60",
      destination: "14.2 km",
      from: "546 Poplar Ln, Riverpark",
      to: "321 Vine Ave, Seaside",
      requestTime: "3:10 PM",
      ago: "45 min",
      rating: "4/5"
    },
    {
      driverName: "Mohamed Saber",
      status: "active",
      salary: "21.50",
      destination: "6.8 km",
      from: "987 Cypress St, Eastbay",
      to: "123 Jasmine Rd, Central City",
      requestTime: "Now",
      ago: "10 min",
      rating: "5/5"
    },
    {
      driverName: "Chloe Brown",
      status: "completed",
      salary: "35.00",
      destination: "11.7 km",
      from: "654 Walnut Dr, Sunville",
      to: "321 Orange Ave, Lakeview",
      requestTime: "2:50 PM",
      ago: "30 min",
      rating: "4/5"
    },
    {
      driverName: "Henry John",
      status: "completed",
      salary: "26.70",
      destination: "8.9 km",
      from: "543 Apple Blvd, Brookside",
      to: "678 Lemon St, Uptown",
      requestTime: "1:20 PM",
      ago: "22 min",
      rating: "4/5"
    }
  ];

  filteredTrips: ITripStatus[] = [];
  selectedStatus: string = 'All';

  ngOnInit(): void {
    this.filterTrips('All'); // default to show all
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  filterTrips(status: string): void {
    this.selectedStatus = status;

    if (status === 'All') {
      this.filteredTrips = this.tripStatus;
    }
    else {
      this.filteredTrips = this.tripStatus.filter(trip =>
        trip.status.toLowerCase() === status.toLowerCase()
      );
    }
  }
}

