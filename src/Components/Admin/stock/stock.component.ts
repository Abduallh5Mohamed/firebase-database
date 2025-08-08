// stock.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Part {
  name: string;
  partNumber: string;
  quantity: string;
  location: string;
  status: 'available' | 'order' | 'low';
}

interface ServiceData {
  name: string;
  percentage: number;
}

interface ServiceCost {
  service: string;
  count: number;
  amount: string;
  average: string;
  color: string;
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css'],
})
export class StockComponent implements OnInit {
  searchText: string = '';
  originalPartsList: Part[] = [];
  filteredPartsList: Part[] = [];

  // Statistics
  availableParts: number = 285;
  partsOnOrder: number = 18;
  servicesToday: number = 12;
  emergencyCalls: number = 3;

  // Service frequency chart data
  serviceData: ServiceData[] = [
    { name: 'Brake Pads', percentage: 92 },
    { name: 'Oil Filter', percentage: 85 },
    { name: 'Spark Plugs', percentage: 78 },
    { name: 'Air Filter', percentage: 71 },
    { name: 'Battery', percentage: 65 },
    { name: 'Wiper Blades', percentage: 58 },
    { name: 'Timing Belt', percentage: 45 },
    { name: 'Fuel Pump', percentage: 32 },
  ];

  // Service costs breakdown
  serviceCosts: ServiceCost[] = [
    {
      service: 'Premium Brake Pads',
      count: 24,
      amount: '3,600 EGP',
      average: '150 EGP',
      color: '#3b82f6',
    },
    {
      service: 'Oil Filter & Change',
      count: 18,
      amount: '1,800 EGP',
      average: '100 EGP',
      color: '#10b981',
    },
    {
      service: 'Spark Plugs Set',
      count: 15,
      amount: '2,250 EGP',
      average: '150 EGP',
      color: '#f59e0b',
    },
    {
      service: 'Car Battery 12V',
      count: 12,
      amount: '4,800 EGP',
      average: '400 EGP',
      color: '#ef4444',
    },
    {
      service: 'Timing Belt Kit',
      count: 8,
      amount: '2,400 EGP',
      average: '300 EGP',
      color: '#8b5cf6',
    },
  ];

  constructor() {}

  ngOnInit(): void {
    this.originalPartsList = [
      {
        name: 'Premium Brake Pads Set',
        partNumber: 'BP2024-001',
        quantity: '32',
        location: 'Service Van A',
        status: 'available',
      },
      {
        name: 'Professional Tire Repair Kit',
        partNumber: 'TRK2024-01',
        quantity: '22',
        location: 'Service Van C',
        status: 'available',
      },
      {
        name: 'Radiator Coolant Hose',
        partNumber: 'RCH2024-350',
        quantity: '5',
        location: 'Main Warehouse',
        status: 'low',
      },
      {
        name: 'LED Headlight Bulb H7',
        partNumber: 'LED2024-H7',
        quantity: '18',
        location: 'Service Van A',
        status: 'available',
      },
      {
        name: 'Electric Fuel Pump Assembly',
        partNumber: 'FP2024-888',
        quantity: '3',
        location: 'Main Warehouse',
        status: 'order',
      },
      {
        name: 'All-Weather Wiper Blades',
        partNumber: 'WB2024-24',
        quantity: '35',
        location: 'Service Van B',
        status: 'available',
      },
      {
        name: 'HEPA Cabin Air Filter',
        partNumber: 'CAF2024-002',
        quantity: '4',
        location: 'Service Van C',
        status: 'order',
      },
      {
        name: 'Iridium Spark Plugs (Premium)',
        partNumber: 'ISP2024-003',
        quantity: '12',
        location: 'Service Van A',
        status: 'low',
      },
      {
        name: 'High-Flow Air Filter',
        partNumber: 'AF2024-004',
        quantity: '38',
        location: 'Main Warehouse',
        status: 'available',
      },
    ];

    this.filteredPartsList = [...this.originalPartsList];
    this.updateStatistics();
  }

  applyFilter(): void {
    if (!this.searchText.trim()) {
      this.filteredPartsList = [...this.originalPartsList];
      return;
    }

    const searchTerm = this.searchText.toLowerCase();
    this.filteredPartsList = this.originalPartsList.filter(
      (part) =>
        part.name.toLowerCase().includes(searchTerm) ||
        part.partNumber.toLowerCase().includes(searchTerm) ||
        part.location.toLowerCase().includes(searchTerm) ||
        part.status.toLowerCase().includes(searchTerm)
    );
  }

  updateStatistics(): void {
    this.availableParts =
      this.originalPartsList.filter((part) => part.status === 'available')
        .length * 8;
    this.partsOnOrder =
      this.originalPartsList.filter((part) => part.status === 'order').length *
      12;
  }

  getRowClass(status: string): string {
    switch (status) {
      case 'low':
        return 'row-warning';
      case 'order':
        return 'row-danger';
      default:
        return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'order':
        return 'status-order';
      case 'low':
        return 'status-low';
      default:
        return 'status-available';
    }
  }

  // ... rest of your existing methods ...
}
