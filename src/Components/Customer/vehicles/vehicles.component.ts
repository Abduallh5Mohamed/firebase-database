import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseServiceService } from '../../../Services/firebase-service.service';
import { AuthService } from '../../../Services/auth.service';
import Swal from 'sweetalert2';

interface Vehicle {
  id: number;
  name: string;
  year: number;
  color: string;
  plateNumber: string;
  currentMileage: string;
  nextServiceDue: string;
  image: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-vehicles',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css'],
})
export class VehiclesComponent {
  vehicles: Vehicle[] = [
    {
      id: 1,
      name: 'Dodge',
      year: 2021,
      color: 'Dark',
      plateNumber: 'ABC-123',
      currentMileage: '45,000',
      nextServiceDue: 'Oil Change (500 miles)',
      image: './assets/vehicles-img/Dodge.jpeg',
      email: 'dodge.owner@email.com',
      password: 'dodge123',
    },
    {
      id: 2,
      name: 'Jeep Renegade',
      year: 2022,
      color: 'Blue',
      plateNumber: 'FGH-652',
      currentMileage: '41,200',
      nextServiceDue: 'Battery Check (800 miles)',
      image: './assets/vehicles-img/jeep.jpeg',
      email: 'jeep.owner@email.com',
      password: 'jeep456',
    },
    {
      id: 3,
      name: 'BMW x6',
      year: 2024,
      color: 'Gray',
      plateNumber: 'XYZ-789',
      currentMileage: '38,000',
      nextServiceDue: 'Oil Change (500 miles)',
      image: './assets/vehicles-img/BMW_x6.jpeg',
      email: 'bmw.owner@email.com',
      password: 'bmw789',
    },
  ];

  // Modal state
  showAddVehicleModal = false;
  showScheduleServiceModal = false;
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;

  // Flag for add or edit mode
  isEditMode = false;

  // The vehicle being edited (null if adding)
  editingVehicleId: number | null = null;

  // The vehicle being scheduled for service
  selectedVehicleForService: Vehicle | null = null;

  // Form model
  newVehicle: Omit<Vehicle, 'id'> = this.getEmptyVehicle();

  // Service scheduling form
  serviceForm: FormGroup;

  // Loading states
  isLoading = false;
  isGettingLocation = false;
  isGettingLocation = false;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseServiceService,
    private authService: AuthService
  ) {
    this.serviceForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      technician: ['', Validators.required],
      date: ['', Validators.required],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      serviceType: ['General Service', Validators.required],
      location: ['', Validators.required]
    });
  }

  trackByVehicleId(index: number, vehicle: Vehicle): number {
    return vehicle.id;
  }

  // Utility to get empty vehicle model
  getEmptyVehicle(): Omit<Vehicle, 'id'> {
    return {
      name: '',
      year: 2024,
      color: '',
      plateNumber: '',
      currentMileage: '',
      nextServiceDue: 'Oil Change (3,000 miles)',
      image: '',
      email: '',
      password: '',
    };
  }

  // Open modal for adding vehicle
  openAddVehicleModal(): void {
    this.isEditMode = false;
    this.editingVehicleId = null;
    this.newVehicle = this.getEmptyVehicle();
    this.imagePreview = null;
    this.selectedImageFile = null;
    this.showAddVehicleModal = true;
  }

  // Open modal for editing vehicle
  editVehicle(vehicle: Vehicle): void {
    this.isEditMode = true;
    this.editingVehicleId = vehicle.id;

    // Copy vehicle data to form (except id)
    this.newVehicle = {
      name: vehicle.name,
      year: vehicle.year,
      color: vehicle.color,
      plateNumber: vehicle.plateNumber,
      currentMileage: vehicle.currentMileage,
      nextServiceDue: vehicle.nextServiceDue,
      image: vehicle.image,
      email: vehicle.email,
      password: vehicle.password,
    };
    this.imagePreview = vehicle.image;
    this.selectedImageFile = null;

    this.showAddVehicleModal = true;
  }

  // Close modal
  closeAddVehicleModal(): void {
    this.showAddVehicleModal = false;
  }

  // Add or Update vehicle on form submit
  submitVehicle(): void {
    if (!this.isFormValid()) return;

    if (this.isEditMode && this.editingVehicleId !== null) {
      // Update existing vehicle
      const index = this.vehicles.findIndex(v => v.id === this.editingVehicleId);
      if (index !== -1) {
        this.vehicles[index] = {
          id: this.editingVehicleId,
          ...this.newVehicle,
          image: this.imagePreview || './assets/vehicles-img/default-car.jpg'
        };
        console.log('Vehicle updated:', this.vehicles[index]);
      }
    } else {
      // Add new vehicle
      const newId = Math.max(...this.vehicles.map(v => v.id), 0) + 1;
      const vehicle: Vehicle = {
        id: newId,
        ...this.newVehicle,
        image: this.imagePreview || './assets/vehicles-img/default-car.jpg'
      };
      this.vehicles.push(vehicle);
      console.log('Vehicle added:', vehicle);
    }

    this.closeAddVehicleModal();
  }

  // Confirm and delete vehicle
  confirmDelete(vehicleId: number): void {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.deleteVehicle(vehicleId);
    }
  }

  private deleteVehicle(vehicleId: number): void {
    this.vehicles = this.vehicles.filter(v => v.id !== vehicleId);
    console.log('Vehicle deleted:', vehicleId);
  }

  // Image file selection handler
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImageFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
        this.newVehicle.image = this.imagePreview;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }

  // Trigger file input click
  triggerFileInput(): void {
    const fileInput = document.getElementById('vehicleImage') as HTMLInputElement;
    fileInput?.click();
  }

  // Form validation
  private isFormValid(): boolean {
    return this.newVehicle.name.trim() !== '' &&
           this.newVehicle.color.trim() !== '' &&
           this.newVehicle.plateNumber.trim() !== '' &&
           this.newVehicle.currentMileage.trim() !== '';
  }

  // Service scheduling methods
  openScheduleServiceModal(vehicle: Vehicle): void {
    console.log('Vehicles Component: Opening service modal for vehicle:', vehicle);
    this.selectedVehicleForService = vehicle;
    this.showScheduleServiceModal = true;
    this.serviceForm.reset({
      title: '',
      description: '',
      price: 0,
      technician: '',
      date: '',
      rating: 5,
      serviceType: 'General Service',
      location: ''
    });
  }

  closeScheduleServiceModal(): void {
    this.showScheduleServiceModal = false;
    this.selectedVehicleForService = null;
    this.serviceForm.reset({
      title: '',
      description: '',
      price: 0,
      technician: '',
      date: '',
      rating: 5,
      serviceType: 'General Service',
      location: ''
    });
  }

  async scheduleService(): Promise<void> {
    if (this.serviceForm.valid && this.selectedVehicleForService) {
      const formValue = this.serviceForm.value;
      console.log('Vehicles Component: Scheduling service with form data:', formValue);
      
      try {
        // Prepare service data for Firebase
        const serviceData = {
          title: formValue.title,
          description: formValue.description || `${formValue.title} for ${this.selectedVehicleForService.year} ${this.selectedVehicleForService.name}`,
          price: formValue.price,
          technician: formValue.technician,
          vehicle: `${this.selectedVehicleForService.year} ${this.selectedVehicleForService.name}`,
          serviceDate: new Date(formValue.date),
          rating: formValue.rating,
          serviceType: formValue.serviceType,
          location: formValue.location
        };

        // Add service to Firebase
        const serviceId = await this.firebaseService.addServiceBooking(serviceData);
        console.log('Vehicles Component: Service added to Firebase with ID:', serviceId);

        // Close modal and show success message
        this.closeScheduleServiceModal();
        
        // Show SweetAlert success message
        Swal.fire({
          icon: 'success',
          title: 'تم بنجاح!',
          text: 'تم جدولة الخدمة بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#ff3b3b'
        });
        
      } catch (error) {
        console.error('Vehicles Component: Error scheduling service:', error);
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في جدولة الخدمة. يرجى المحاولة مرة أخرى.',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#ff3b3b'
        });
      }
    } else {
      console.log('Vehicles Component: Form is invalid:', this.serviceForm.errors);
      // Mark all fields as touched to show validation errors
      Object.keys(this.serviceForm.controls).forEach(key => {
        this.serviceForm.get(key)?.markAsTouched();
      });
    }
  }

  // Get field error message
  getFieldError(fieldName: string): string {
    const field = this.serviceForm.get(fieldName);
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
          this.serviceForm.patchValue({ location: locationString });
          
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
}