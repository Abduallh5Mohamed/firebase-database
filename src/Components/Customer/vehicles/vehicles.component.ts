import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ServiceHistoryService } from '../dashboard/service-history.service';
import { OrderCommunicationService } from '../../../Services/order-communication.service';

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

  constructor(
    private fb: FormBuilder,
    private serviceHistoryService: ServiceHistoryService,
    private orderCommunicationService: OrderCommunicationService
  ) {
    this.serviceForm = this.fb.group({
      title: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      technician: ['', Validators.required],
      date: ['', Validators.required],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
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
      price: 0,
      technician: '',
      date: '',
      rating: 5,
    });
  }

  closeScheduleServiceModal(): void {
    this.showScheduleServiceModal = false;
    this.selectedVehicleForService = null;
    this.serviceForm.reset({
      title: '',
      price: 0,
      technician: '',
      date: '',
      rating: 5,
    });
  }

  scheduleService(): void {
    if (this.serviceForm.valid && this.selectedVehicleForService) {
      const formValue = this.serviceForm.value;
      console.log('Vehicles Component: Scheduling service with form data:', formValue);
      
      // Generate a random customer name
      const randomCustomerNames = [
        'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
        'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'William Garcia',
        'Amanda Rodriguez', 'James Lopez', 'Michelle Gonzalez', 'Christopher Perez',
        'Jessica Torres', 'Daniel Ramirez', 'Ashley Lewis', 'Matthew Clark',
        'Nicole Lee', 'Joshua Walker', 'Stephanie Hall', 'Andrew Allen',
        'Rebecca Young', 'Kevin King', 'Laura Wright', 'Brian Scott',
        'Melissa Green', 'Steven Baker', 'Heather Adams', 'Timothy Nelson',
        'Amber Carter', 'Jason Mitchell', 'Rachel Roberts', 'Jeffrey Turner',
        'Megan Phillips', 'Ryan Campbell', 'Lauren Parker', 'Gary Evans',
        'Kimberly Edwards', 'Nicholas Collins', 'Christine Stewart', 'Eric Morris',
        'Angela Rogers', 'Jonathan Reed', 'Tiffany Cook', 'Justin Bailey',
        'Brittany Cooper', 'Brandon Richardson', 'Samantha Cox', 'Tyler Ward',
        'Vanessa Torres', 'Sean Peterson', 'Crystal Gray', 'Nathan James',
        'Monica Butler', 'Adam Simmons', 'Erica Foster', 'Kyle Gonzales',
        'Tracy Bryant', 'Derek Alexander', 'Stacy Russell', 'Brent Griffin',
        'Diana Diaz', 'Travis Hayes', 'Natalie Sanders', 'Marcus Price',
        'Holly Bennett', 'Corey Wood', 'Jacqueline Barnes', 'Dustin Ross',
        'Catherine Henderson', 'Gregory Coleman', 'Bethany Jenkins', 'Lance Perry',
        'Misty Powell', 'Derrick Long', 'Kristina Patterson', 'Troy Hughes',
        'Gina Flores', 'Mario Butler', 'Yolanda Simmons', 'Dwayne Foster',
        'Latoya Gonzales', 'Malik Bryant', 'Shanice Alexander', 'Terrell Russell',
        'Keisha Griffin', 'Darnell Diaz', 'Tameka Hayes', 'Lamar Sanders'
      ];
      const randomIndex = Math.floor(Math.random() * randomCustomerNames.length);
      const customerName = randomCustomerNames[randomIndex];
      
      // Generate random payment status
      const randomPaymentStatus = Math.random() > 0.5 ? 'Success' : 'Pending';
      
      // Create new service object
      const newService = {
        id: Date.now(),
        title: formValue.title,
        status: 'Completed',
        price: formValue.price,
        rating: formValue.rating,
        date: this.formatDate(formValue.date),
        technician: formValue.technician,
        vehicle: `${this.selectedVehicleForService.year} ${this.selectedVehicleForService.name}`,
        location: 'Main Branch',
        duration: '60 mins',
        serviceType: 'General Service'
      };

      // Add to service history using the service
      this.serviceHistoryService.addService(newService);
      console.log('Vehicles Component: Service added to service history:', newService);
      
      // Add to admin orders component
      const orderData = {
        title: formValue.title,
        price: formValue.price,
        technician: formValue.technician,
        vehicle: `${this.selectedVehicleForService.year} ${this.selectedVehicleForService.name}`,
        date: formValue.date,
        location: 'Main Branch',
        customerName: customerName,
        payment: randomPaymentStatus
      };
      console.log('Vehicles Component: Adding order data to admin:', orderData);
      
      try {
        this.orderCommunicationService.addCustomerOrder(orderData);
        console.log('Vehicles Component: Order data successfully sent to admin');
      } catch (error) {
        console.error('Vehicles Component: Error sending order data to admin:', error);
      }
      
      // Close modal and reset form
      this.closeScheduleServiceModal();
    } else {
      console.log('Vehicles Component: Form is invalid:', this.serviceForm.errors);
    }
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
