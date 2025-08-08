import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServiceHistoryService {
  private history = new BehaviorSubject<any[]>([
    {
      id: 1,
      title: 'Oil Change Service',
      status: 'Completed',
      price: 89.99,
      rating: 5,
      date: '2024-08-15',
      technician: 'John Smith',
      vehicle: 'Toyota Camry 2020',
      location: 'Main Branch',
      duration: '45 mins',
      serviceType: 'Oil Change'
    },
    {
      id: 2,
      title: 'Brake Inspection',
      status: 'Completed',
      price: 120.00,
      rating: 4,
      date: '2024-08-10',
      technician: 'Sarah Johnson',
      vehicle: 'Honda Civic 2019',
      location: 'Main Branch',
      duration: '60 mins',
      serviceType: 'Brake Service'
    },
    {
      id: 3,
      title: 'Tire Rotation',
      status: 'Completed',
      price: 45.00,
      rating: 5,
      date: '2024-08-05',
      technician: 'Mike Wilson',
      vehicle: 'Toyota Camry 2020',
      location: 'Main Branch',
      duration: '30 mins',
      serviceType: 'Tire Service'
    },
    {
      
      id: 4,
      title: 'Battery Replacement',
      status: 'Completed',
      price: 150.00,
      rating: 4,
      date: '2024-07-28',
      technician: 'Emily Clark',
      vehicle: 'Nissan Altima 2018',
      location: 'East Branch',
      duration: '50 mins',
      serviceType: 'Battery Service'
    },
    {
      id: 5,
      title: 'Air Filter Change',
      status: 'Completed',
      price: 30.00,
      rating: 5,
      date: '2024-07-15',
      technician: 'David Lee',
      vehicle: 'Hyundai Elantra 2021',
      location: 'West Branch',
      duration: '20 mins',
      serviceType: 'Filter Service'
    }
  ]);
  history$ = this.history.asObservable();

  addService(service: any) {
    const current = this.history.value;
    this.history.next([service, ...current]);
  }
}
