import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseServiceService, ServiceBooking } from '../../../Services/firebase-service.service';
import { AuthService } from '../../../Services/auth.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

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
  isGettingLocation = false;

  // Filter options
  selectedServiceType: string = 'all';
  selectedVehicle: string = 'all';

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseServiceService,
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
      location: ['', Validators.required]
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
      location: ''
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
      location: ''
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

        // Close modal and show success message
        this.closeAddServiceModal();
        
        // Show SweetAlert success message
        Swal.fire({
          icon: 'success',
          title: 'تم بنجاح!',
          text: 'تم إضافة الخدمة بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#ff3b3b'
        });
        
      } catch (error: any) {
        console.error('Service History: Error adding service:', error);
        if (error.message && error.message.includes('Permission denied')) {
          this.errorMessage = 'Permission denied. Please check your account permissions or contact support.';
        } else {
          this.errorMessage = 'Failed to add service. Please try again.';
        }
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

  // Get current location
  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'المتصفح لا يدعم خدمة تحديد الموقع',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#ff3b3b'
      });
      return;
    }

    this.isGettingLocation = true;
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Use a simple format for coordinates
          const locationString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          this.addServiceForm.patchValue({ location: locationString });
          
          Swal.fire({
            icon: 'success',
            title: 'تم تحديد الموقع',
            text: 'تم الحصول على موقعك الحالي بنجاح',
            timer: 2000,
            showConfirmButton: false
          });
          
        } catch (error) {
          console.error('Error getting location:', error);
          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: 'فشل في تحديد الموقع',
            confirmButtonText: 'موافق',
            confirmButtonColor: '#ff3b3b'
          });
        } finally {
          this.isGettingLocation = false;
        }
      },
      (error) => {
        this.isGettingLocation = false;
        let errorMessage = 'فشل في تحديد الموقع';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'تم رفض الإذن للوصول إلى الموقع';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'معلومات الموقع غير متاحة';
            break;
          case error.TIMEOUT:
            errorMessage = 'انتهت مهلة طلب الموقع';
            break;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'خطأ في الموقع',
          text: errorMessage,
          confirmButtonText: 'موافق',
          confirmButtonColor: '#ff3b3b'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  // Get today's date in YYYY-MM-DD format for date input min attribute
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  trackByServiceId(index: number, service: ServiceBooking): number {
    return service.id ? parseInt(service.id) : index;
  }
}