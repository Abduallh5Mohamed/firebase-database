import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseServiceService, ServiceBooking } from '../../../Services/firebase-service.service';
import { AdminOrdersService } from '../../../Services/admin-orders.service';
import { AuthService } from '../../../Services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-service-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-history.component.html',
  styleUrls: ['./service-history.component.css'],
})
export class ServiceHistoryComponent implements OnInit {
  serviceHistory: ServiceBooking[] = [];
  showAddServiceModal: boolean = false;
  addServiceForm: FormGroup;
  private subscriptions: Subscription[] = [];
  isLoading = false;
  errorMessage = '';

  // Filter options
  selectedServiceType: string = 'all';
  selectedVehicle: string = 'all';

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
    this.loadServiceHistory();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadServiceHistory(): void {
    const servicesSub = this.firebaseService.getCurrentUserServices().subscribe((history: ServiceBooking[]) => {
      this.serviceHistory = history;
      console.log('Service history loaded:', history);
    });
    
    this.subscriptions.push(servicesSub);
  }

  get filteredServices(): ServiceBooking[] {
    return this.serviceHistory.filter(service => {
      const matchesServiceType =
        this.selectedServiceType === 'all' || service.serviceType === this.selectedServiceType;
      const matchesVehicle =
        this.selectedVehicle === 'all' || service.vehicle.includes(this.selectedVehicle);
      return matchesServiceType && matchesVehicle;
    });
  }

  openAddServiceModal(): void {
    this.showAddServiceModal = true;
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
      console.log('Service History: Adding new service with form data:', formValue);
      
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
        console.log('Service History: Service added to Firebase with ID:', serviceId);

        // Get current user data for admin order
        const currentUser = this.authService.getCurrentUser();
        const userData = this.authService.getUserData();
        const customerName = userData?.displayName || currentUser?.displayName || 'Customer';

        // Add to admin orders
        await this.adminOrdersService.addOrderFromService(
          { ...serviceData, id: serviceId },
          customerName
        );
        console.log('Service History: Order added to admin dashboard');

        // Close modal and show success message
        this.closeAddServiceModal();
        alert('Service added successfully!');
        
      } catch (error) {
        console.error('Service History: Error adding service:', error);
        this.errorMessage = 'Failed to add service. Please try again.';
      } finally {
        this.isLoading = false;
      }
    } else {
      console.log('Service History: Form is invalid:', this.addServiceForm.errors);
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

  trackByServiceId(index: number, service: ServiceBooking): number {
    return service.id ? parseInt(service.id) : index;
  }
}
