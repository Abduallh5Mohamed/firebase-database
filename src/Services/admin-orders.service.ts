import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AdminOrder {
  id?: string;
  orderId: string;
  serviceId?: string;
  date: string;
  customer: string;
  serviceType: string;
  amount: number;
  status: 'pending' | 'completed' | 'in-progress' | 'scheduled' | 'cancelled';
  technician: string;
  vehicle: string;
  location: string;
  items: number;
  fulfillment: 'Unfulfilled' | 'Fulfilled';
  payment: 'Pending' | 'Success';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdminOrdersService {
  private ordersSubject = new BehaviorSubject<AdminOrder[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor(private firestore: Firestore) {
    this.initializeRealtimeListener();
  }

  // Initialize real-time listener for admin orders
  private initializeRealtimeListener(): void {
    const ordersRef = collection(this.firestore, 'adminOrders');
    const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));

    onSnapshot(ordersQuery, (snapshot) => {
      const orders: AdminOrder[] = [];
      snapshot.forEach((doc) => {
        orders.push({ ...doc.data(), id: doc.id } as AdminOrder);
      });
      this.ordersSubject.next(orders);
    });
  }

  // Add new order from customer service booking
  async addOrderFromService(serviceData: any, customerName: string): Promise<string> {
    try {
      const newOrder: Omit<AdminOrder, 'id'> = {
        orderId: `#SRV${Date.now()}`,
        serviceId: serviceData.id,
        date: this.formatDate(serviceData.serviceDate || new Date()),
        customer: customerName,
        serviceType: serviceData.title,
        amount: serviceData.price,
        status: 'scheduled',
        technician: serviceData.technician,
        vehicle: serviceData.vehicle,
        location: serviceData.location || 'Main Branch',
        items: 1,
        fulfillment: 'Unfulfilled',
        payment: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(this.firestore, 'adminOrders'), newOrder);
      return docRef.id;
    } catch (error) {
      console.error('Error adding admin order:', error);
      throw error;
    }
  }

  // Get all orders
  async getAllOrders(): Promise<AdminOrder[]> {
    try {
      const ordersRef = collection(this.firestore, 'adminOrders');
      const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(ordersQuery);
      
      const orders: AdminOrder[] = [];
      snapshot.forEach((doc) => {
        orders.push({ ...doc.data(), id: doc.id } as AdminOrder);
      });

      return orders;
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: AdminOrder['status']): Promise<void> {
    try {
      const orderRef = doc(this.firestore, 'adminOrders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Delete order
  async deleteOrder(orderId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'adminOrders', orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // Get orders observable
  getOrders(): Observable<AdminOrder[]> {
    return this.orders$;
  }

  // Format date for display
  private formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  }
}