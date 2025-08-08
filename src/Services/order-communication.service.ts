import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CustomerOrder {
  id: string;
  date: string;
  customer: string;
  payment: 'Pending' | 'Success';
  total: number;
  delivery: string;
  items: number;
  fulfillment: 'Unfulfilled' | 'Fulfilled';
  serviceType?: string;
  vehicle?: string;
  technician?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderCommunicationService {
  private customerOrders = new BehaviorSubject<CustomerOrder[]>([]);
  customerOrders$ = this.customerOrders.asObservable();
  private storageKey = 'customerOrders';

  constructor() {
    console.log('OrderCommunicationService initialized');
    // Log the initial state
    console.log('Initial customer orders state:', this.customerOrders.value);

    // Load persisted orders from localStorage (if any)
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.customerOrders.next(parsed);
          console.log('Loaded customer orders from localStorage:', parsed);
        } else {
          console.warn('localStorage customerOrders is not an array; ignoring');
        }
      }
    } catch (e) {
      console.warn('Failed to load customer orders from localStorage:', e);
    }

    // Listen for cross-tab updates via the storage event and sync immediately
    try {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === this.storageKey) {
          try {
            const value = event.newValue ? JSON.parse(event.newValue) : [];
            if (Array.isArray(value)) {
              console.log('OrderCommunicationService: Detected storage change, syncing orders:', value);
              this.customerOrders.next(value);
            }
          } catch (err) {
            console.warn('OrderCommunicationService: Failed to parse storage event value:', err);
          }
        }
      });
    } catch (e) {
      console.warn('OrderCommunicationService: Failed to attach storage listener:', e);
    }
  }

  // Method to add a new order from customer dashboard
  addCustomerOrder(serviceData: any): void {
    console.log('OrderCommunicationService: Adding customer order with data:', serviceData);
    
    // Relax validation: allow missing optional fields like title and use sensible defaults
    if (!serviceData) {
      console.error('OrderCommunicationService: Invalid service data provided (null/undefined):', serviceData);
      return;
    }
    
    // Generate a globally-unique ID to avoid collisions with seeded admin orders
    // Use timestamp-based ID prefixed to keep formatting consistent
    const newId = `#C${Date.now()}`;
    
    // Normalize/derive fields from incoming modal data
    const statusRaw: string = (serviceData.status || '').toString().toLowerCase();
    const payment: 'Pending' | 'Success' = serviceData.payment
      ? serviceData.payment
      : (statusRaw === 'completed' || statusRaw === 'success') ? 'Success' : 'Pending';
    const fulfillment: 'Unfulfilled' | 'Fulfilled' = serviceData.fulfillment
      ? serviceData.fulfillment
      : (statusRaw === 'completed') ? 'Fulfilled' : 'Unfulfilled';
    const dateStr: string = serviceData.date
      ? this.formatDate(new Date(serviceData.date))
      : this.formatDate(new Date());

    const newOrder: CustomerOrder = {
      id: newId,
      date: dateStr,
      customer: serviceData.customerName || 'Unknown Customer',
      payment,
      total: Number(serviceData.price) || 0,
      delivery: serviceData.location || 'Unknown Location',
      items: Number(serviceData.items) || 1,
      fulfillment,
      serviceType: serviceData.title || serviceData.serviceType || 'General Service',
      vehicle: serviceData.vehicle || 'Unknown Vehicle',
      technician: serviceData.technician || 'Unassigned'
    };

    const currentOrders = this.customerOrders.value;
    const updatedOrders = [...currentOrders, newOrder];
    
    console.log('OrderCommunicationService: Current orders before update:', currentOrders);
    console.log('OrderCommunicationService: New order to be added:', newOrder);
    console.log('OrderCommunicationService: Updated orders array:', updatedOrders);
    
    // Emit the updated orders
    this.customerOrders.next(updatedOrders);
    // Persist to localStorage for cross-route availability
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(updatedOrders));
    } catch (e) {
      console.warn('Failed to persist customer orders to localStorage:', e);
    }
    
    console.log('OrderCommunicationService: Customer order added:', newOrder);
    console.log('OrderCommunicationService: Total customer orders:', updatedOrders.length);
    console.log('OrderCommunicationService: All customer orders:', updatedOrders);
    
    // Verify the data was emitted
    setTimeout(() => {
      const currentValue = this.customerOrders.value;
      console.log('OrderCommunicationService: Verification - Current customer orders after emission:', currentValue);
    }, 100);
  }

  // Method to get all customer orders
  getCustomerOrders(): Observable<CustomerOrder[]> {
    return this.customerOrders$;
  }

  // Method to get current orders array
  getCurrentOrders(): CustomerOrder[] {
    const currentOrders = this.customerOrders.value;
    console.log('OrderCommunicationService: Current orders:', currentOrders);
    return currentOrders;
  }

  // Method to check if service is working
  checkServiceStatus(): void {
    console.log('OrderCommunicationService: Service status check');
    console.log('OrderCommunicationService: Current orders count:', this.customerOrders.value.length);
    console.log('OrderCommunicationService: Current orders:', this.customerOrders.value);
  }

  // Method to force refresh the data
  forceRefresh(): void {
    const currentOrders = this.customerOrders.value;
    console.log('OrderCommunicationService: Force refreshing with current orders:', currentOrders);
    this.customerOrders.next([...currentOrders]);
  }

  // Method to clear all customer orders
  clearCustomerOrders(): void {
    console.log('OrderCommunicationService: Clearing all customer orders');
    this.customerOrders.next([]);
    // Also clear from localStorage
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.warn('Failed to clear customer orders from localStorage:', e);
    }
  }

  private formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  }
}
