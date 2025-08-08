import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc, onSnapshot } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ServiceBooking {
  id?: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  technician: string;
  vehicle: string;
  serviceDate: Date;
  rating: number;
  status: 'scheduled' | 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  location?: string;
  duration?: string;
  serviceType?: string;
}

export interface UpcomingService {
  id?: string;
  day: string;
  month: string;
  title: string;
  description: string;
  vehicle: string;
  time: string;
  status: string;
  statusText: string;
  serviceDate: Date;
  price: number;
  technician: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseServiceService {
  private servicesSubject = new BehaviorSubject<ServiceBooking[]>([]);
  public services$ = this.servicesSubject.asObservable();

  private upcomingServicesSubject = new BehaviorSubject<UpcomingService[]>([]);
  public upcomingServices$ = this.upcomingServicesSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {
    this.initializeRealtimeListeners();
  }

  // Initialize real-time listeners
  private initializeRealtimeListeners(): void {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      this.setupUserServicesListener(currentUser.uid);
    }

    // Listen for auth state changes
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.setupUserServicesListener(user.uid);
      } else {
        this.servicesSubject.next([]);
        this.upcomingServicesSubject.next([]);
      }
    });
  }

  // Setup real-time listener for user services
  private setupUserServicesListener(userId: string): void {
    try {
      const servicesRef = collection(this.firestore, 'services');
      
      // Start with fallback listener to avoid index requirement
      this.setupFallbackListener(userId);
    } catch (error) {
      console.error('Error setting up services listener:', error);
      this.servicesSubject.next([]);
      this.upcomingServicesSubject.next([]);
    }
  }

  // Fallback listener without orderBy to avoid index requirement
  private setupFallbackListener(userId: string): void {
    try {
      const servicesRef = collection(this.firestore, 'services');
      const userServicesQuery = query(
        servicesRef,
        where('userId', '==', userId)
      );

      onSnapshot(userServicesQuery, 
        (snapshot) => {
          const services: ServiceBooking[] = [];
          const upcomingServices: UpcomingService[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data() as ServiceBooking;
            const service = { ...data, id: doc.id };
            services.push(service);

            if (service.status === 'scheduled' || service.status === 'pending') {
              const upcoming = this.convertToUpcomingService(service);
              upcomingServices.push(upcoming);
            }
          });

          // Sort manually since we can't use orderBy
          services.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          upcomingServices.sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime());

          this.servicesSubject.next(services);
          this.upcomingServicesSubject.next(upcomingServices);
        },
        (error: any) => {
          console.error('Error in fallback services listener:', error);
          this.servicesSubject.next([]);
          this.upcomingServicesSubject.next([]);
        }
      );
    } catch (error) {
      console.error('Error setting up fallback listener:', error);
      this.servicesSubject.next([]);
      this.upcomingServicesSubject.next([]);
    }
  }

  // Add new service booking
  async addServiceBooking(serviceData: Partial<ServiceBooking>): Promise<string> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to book a service');
      }

      const newService: ServiceBooking = {
        userId: currentUser.uid,
        title: serviceData.title || '',
        description: serviceData.description || '',
        price: serviceData.price || 0,
        technician: serviceData.technician || '',
        vehicle: serviceData.vehicle || '',
        serviceDate: serviceData.serviceDate || new Date(),
        rating: serviceData.rating || 5,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
        location: serviceData.location || '',
        duration: serviceData.duration || '60 mins',
        serviceType: serviceData.serviceType || 'General Service'
      };

      const docRef = await addDoc(collection(this.firestore, 'services'), newService);
      
      // Also add to admin orders collection for admin dashboard
      try {
        await this.addToAdminOrders(newService, docRef.id);
      } catch (adminError) {
        console.warn('Failed to add to admin orders, but service was created:', adminError);
        // Don't throw error here as the main service was created successfully
      }
      
      return docRef.id;
    } catch (error: any) {
      console.error('Error adding service booking:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check your account permissions or contact support.');
      }
      throw error;
    }
  }

  // Add service to admin orders collection
  private async addToAdminOrders(service: ServiceBooking, serviceId: string): Promise<void> {
    try {
      const orderData = {
        serviceId: serviceId,
        orderId: `#SRV${Date.now()}`,
        date: this.formatDate(service.serviceDate),
        customer: 'Customer', // Will be updated with actual customer name
        serviceType: service.title,
        amount: service.price,
        status: service.status,
        technician: service.technician,
        vehicle: service.vehicle,
        location: service.location,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(this.firestore, 'adminOrders'), orderData);
    } catch (error) {
      console.error('Error adding to admin orders:', error);
    }
  }

  // Get user services
  async getUserServices(userId: string): Promise<ServiceBooking[]> {
    try {
      const servicesRef = collection(this.firestore, 'services');
      const userServicesQuery = query(
        servicesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(userServicesQuery);
      const services: ServiceBooking[] = [];

      snapshot.forEach((doc) => {
        services.push({ ...doc.data(), id: doc.id } as ServiceBooking);
      });

      return services;
    } catch (error) {
      console.error('Error getting user services:', error);
      return [];
    }
  }

  // Get upcoming services
  async getUpcomingServices(userId: string): Promise<UpcomingService[]> {
    try {
      const servicesRef = collection(this.firestore, 'services');
      const upcomingQuery = query(
        servicesRef,
        where('userId', '==', userId),
        where('status', 'in', ['scheduled', 'pending']),
        orderBy('serviceDate', 'asc')
      );

      const snapshot = await getDocs(upcomingQuery);
      const upcomingServices: UpcomingService[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as ServiceBooking;
        const upcoming = this.convertToUpcomingService({ ...data, id: doc.id });
        upcomingServices.push(upcoming);
      });

      return upcomingServices;
    } catch (error) {
      console.error('Error getting upcoming services:', error);
      return [];
    }
  }

  // Update service status
  async updateServiceStatus(serviceId: string, status: ServiceBooking['status']): Promise<void> {
    try {
      const serviceRef = doc(this.firestore, 'services', serviceId);
      await updateDoc(serviceRef, {
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating service status:', error);
      throw error;
    }
  }

  // Delete service
  async deleteService(serviceId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'services', serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  // Convert service booking to upcoming service format
  private convertToUpcomingService(service: ServiceBooking): UpcomingService {
    const serviceDate = service.serviceDate instanceof Date ? service.serviceDate : new Date(service.serviceDate);
    
    return {
      id: service.id,
      day: serviceDate.getDate().toString(),
      month: serviceDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      title: service.title,
      description: service.description,
      vehicle: service.vehicle,
      time: serviceDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: service.status,
      statusText: this.getStatusText(service.status),
      serviceDate: serviceDate,
      price: service.price,
      technician: service.technician
    };
  }

  // Get status text
  private getStatusText(status: string): string {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  }

  // Format date for display
  private formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  }

  // Get current user services observable
  getCurrentUserServices(): Observable<ServiceBooking[]> {
    return this.services$;
  }

  // Get current user upcoming services observable
  getCurrentUserUpcomingServices(): Observable<UpcomingService[]> {
    return this.upcomingServices$;
  }
}