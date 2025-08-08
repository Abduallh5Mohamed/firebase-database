import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { ServiceHistoryComponent } from '../service-history/service-history.component';
import { CustomerProfileComponent } from '../profile/profile.component';
import { FirebaseServiceService, ServiceBooking, UpcomingService } from '../../../Services/firebase-service.service';
import { AdminOrdersService } from '../../../Services/admin-orders.service';
import { AuthService } from '../../../Services/auth.service';
import { Subscription } from 'rxjs';


interface RecentActivity {
  icon: string;
  title: string;
  description: string;
  time: string;
}


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, VehiclesComponent, ServiceHistoryComponent, CustomerProfileComponent, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  activeTab: string = 'dashboard';
  private subscriptions: Subscription[] = [];
  isLoading = false;
  errorMessage = '';

  upcomingServices: UpcomingService[] = [];
  allServices: ServiceBooking[] = [];

  recentActivities: RecentActivity[] = [
    {
      icon: '🔧',
      title: 'Oil Change Completed',
      description: 'Service completed for Toyota Camry',
      time: '2 hours ago'
    },
    {
      icon: '🚗',
      title: 'Vehicle Added',
      description: 'New vehicle Honda Civic added to profile',
      time: '1 day ago'
    },
    {
      icon: '📅',
      title: 'Appointment Scheduled',
      description: 'Brake inspection scheduled for Aug 20',
      time: '2 days ago'
    },
    {
      icon: '💰',
      title: 'Payment Processed',
      description: 'Payment of $85.00 processed for oil change',
      time: '3 days ago'
    }
  ];

  // Modal state
  showAddServiceModal: boolean = false;

  addServiceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseServiceService,
    private adminOrdersService: AdminOrdersService,
    private authService: AuthService
  ) {
    this.addServiceForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      technician: ['', Validators.required],
      vehicle: ['', Validators.required],
      date: ['', Validators.required],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      serviceType: ['General Service', Validators.required],
      location: ['Main Branch', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadUserData(): void {
    // Subscribe to upcoming services
    const upcomingSub = this.firebaseService.getCurrentUserUpcomingServices().subscribe(
      (services) => {
        this.upcomingServices = services;
        console.log('Upcoming services loaded:', services);
      },
      (error) => {
        console.error('Error loading upcoming services:', error);
      }
    );

    // Subscribe to all services for service history
    const servicesSub = this.firebaseService.getCurrentUserServices().subscribe(
      (services) => {
        this.allServices = services;
        console.log('All services loaded:', services);
      },
      (error) => {
        console.error('Error loading services:', error);
      }
    );

    this.subscriptions.push(upcomingSub, servicesSub);
  }

  openAddServiceModal(): void {
    console.log('Customer Dashboard: Opening modal...');
    console.log('Customer Dashboard: Current showAddServiceModal value:', this.showAddServiceModal);
    this.showAddServiceModal = true;
    console.log('Customer Dashboard: showAddServiceModal set to:', this.showAddServiceModal);
    this.addServiceForm.reset({
      title: '',
      description: '',
      price: 0,
      technician: '',
      vehicle: '',
      date: '',
      rating: 5,
      serviceType: 'General Service',
      location: 'Main Branch'
    });
    console.log('Customer Dashboard: Modal should be visible now');
    
    // Force change detection
    setTimeout(() => {
      console.log('Customer Dashboard: Modal state after timeout:', this.showAddServiceModal);
    }, 100);
  }

  closeAddServiceModal(): void {
    this.showAddServiceModal = false;
    this.errorMessage = '';
    this.addServiceForm.reset({
      title: '',
      description: '',
      price: 0,
      technician: '',
      vehicle: '',
      date: '',
      rating: 5,
      serviceType: 'General Service',
      location: 'Main Branch'
    });
  }

  async addNewService(): Promise<void> {
    if (this.addServiceForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const formValue = this.addServiceForm.value;
      console.log('Customer Dashboard: Adding new service with form data:', formValue);
      
      try {
        // Prepare service data for Firebase
        const serviceData = {
          title: formValue.title,
          description: formValue.description,
          price: formValue.price,
          technician: formValue.technician,
          vehicle: formValue.vehicle,
          serviceDate: new Date(formValue.date),
          rating: formValue.rating,
          serviceType: formValue.serviceType,
          location: formValue.location
        };

        // Add service to Firebase
        const serviceId = await this.firebaseService.addServiceBooking(serviceData);
        console.log('Customer Dashboard: Service added to Firebase with ID:', serviceId);

        // Get current user data for admin order
        const currentUser = this.authService.getCurrentUser();
        const userData = this.authService.getUserData();
        const customerName = userData?.displayName || currentUser?.displayName || 'Customer';

        // Add to admin orders
        await this.adminOrdersService.addOrderFromService(
          { ...serviceData, id: serviceId },
          customerName
        );
        console.log('Customer Dashboard: Order added to admin dashboard');

        // Close modal and show success message
        this.closeAddServiceModal();
        alert('Service booked successfully!');
        
      } catch (error) {
        console.error('Customer Dashboard: Error adding service:', error);
        this.errorMessage = 'Failed to book service. Please try again.';
      } finally {
        this.isLoading = false;
      }
    } else {
      console.log('Customer Dashboard: Form is invalid:', this.addServiceForm.errors);
      // Mark all fields as touched to show validation errors
      Object.keys(this.addServiceForm.controls).forEach(key => {
        this.addServiceForm.get(key)?.markAsTouched();
      });
    }
  }

  // Get field error message
  getFieldError(fieldName: string): string {
    const field = this.addServiceForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be greater than 0`;
    }
    return '';
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
