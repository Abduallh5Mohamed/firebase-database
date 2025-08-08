import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ServiceHistoryService } from '../dashboard/service-history.service';
import { OrderCommunicationService } from '../../../Services/order-communication.service';
import { UserDataService } from '../../../Services/user-data.service';

interface ServiceHistory {
  id: number;
  title: string;
  status: string;
  price: number;
  rating: number;
  date: string;
  technician: string;
  vehicle: string;
  location: string;
  duration: string;
  serviceType: string;
}

@Component({
  selector: 'app-service-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-history.component.html',
  styleUrls: ['./service-history.component.css'],
})
export class ServiceHistoryComponent implements OnInit {
  serviceHistory: ServiceHistory[] = [];
  showAddServiceModal: boolean = false;
  addServiceForm: FormGroup;

  // Filter options
  selectedServiceType: string = 'all';
  selectedVehicle: string = 'all';

  constructor(
    public serviceHistoryService: ServiceHistoryService,
    private fb: FormBuilder,
    private orderCommunicationService: OrderCommunicationService,
    private userDataService: UserDataService
  ) {
    this.addServiceForm = this.fb.group({
      title: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      technician: ['', Validators.required],
      vehicle: ['', Validators.required],
      date: ['', Validators.required],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    });
  }

  ngOnInit() {
    this.serviceHistoryService.history$.subscribe((history: ServiceHistory[]) => {
      this.serviceHistory = history;
    });
  }

  get filteredServices(): ServiceHistory[] {
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
      price: 0,
      technician: '',
      vehicle: '',
      date: '',
      rating: 5,
    });
  }

  closeAddServiceModal(): void {
    this.showAddServiceModal = false;
    this.addServiceForm.reset({
      title: '',
      price: 0,
      technician: '',
      vehicle: '',
      date: '',
      rating: 5,
    });
  }

  addNewService(): void {
    if (this.addServiceForm.valid) {
      const formValue = this.addServiceForm.value;
      console.log('Service History: Adding new service with form data:', formValue);
      
      // Generate a random customer name instead of using actual user data
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
      
      const newServiceObj = {
        id: Date.now(),
        title: formValue.title,
        status: 'Completed',
        price: formValue.price,
        rating: formValue.rating,
        date: this.formatDate(formValue.date),
        technician: formValue.technician,
        vehicle: formValue.vehicle,
        location: 'Main Branch',
        duration: '60 mins',
        serviceType: 'General Service'
      };
      
      this.serviceHistoryService.addService(newServiceObj);
      console.log('Service History: Service added to service history:', newServiceObj);
      
      // Add to admin orders component
      const orderData = {
        title: formValue.title,
        price: formValue.price,
        technician: formValue.technician,
        vehicle: formValue.vehicle,
        date: formValue.date,
        location: 'Main Branch',
        customerName: customerName,
        payment: randomPaymentStatus // Add random payment status
      };
      console.log('Service History: Adding order data to admin:', orderData);
      
      try {
        this.orderCommunicationService.addCustomerOrder(orderData);
        console.log('Service History: Order data successfully sent to admin');
      } catch (error) {
        console.error('Service History: Error sending order data to admin:', error);
      }
      
      this.closeAddServiceModal();
    } else {
      console.log('Service History: Form is invalid:', this.addServiceForm.errors);
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

  trackByServiceId(index: number, service: ServiceHistory): number {
    return service.id;
  }
}
