import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { ServiceHistoryComponent } from '../service-history/service-history.component';
import { CustomerProfileComponent } from '../profile/profile.component';
import { ServiceHistoryService } from './service-history.service';
import { OrderCommunicationService } from '../../../Services/order-communication.service';
import { UserDataService } from '../../../Services/user-data.service';

interface UpcomingService {
  day: string;
  month: string;
  title: string;
  description: string;
  vehicle: string;
  time: string;
  status: string;
  statusText: string;
}

interface RecentActivity {
  icon: string;
  title: string;
  description: string;
  time: string;
}

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
  selector: 'app-dashboard',
  imports: [CommonModule, VehiclesComponent, ServiceHistoryComponent, CustomerProfileComponent, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  activeTab: string = 'dashboard';

  upcomingServices: UpcomingService[] = [
    {
      day: '15',
      month: 'Aug',
      title: 'Oil Change & Filter',
      description: 'Regular maintenance service',
      vehicle: 'Toyota Camry',
      time: '10:00 AM',
      status: 'scheduled',
      statusText: 'Scheduled'
    },
    {
      day: '20',
      month: 'Aug',
      title: 'Brake Inspection',
      description: 'Safety check and maintenance',
      vehicle: 'Honda Civic',
      time: '2:00 PM',
      status: 'pending',
      statusText: 'Pending'
    },
    {
      day: '25',
      month: 'Aug',
      title: 'Tire Rotation',
      description: 'Tire maintenance service',
      vehicle: 'Ford Focus',
      time: '11:30 AM',
      status: 'completed',
      statusText: 'Completed'
    }
  ];

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
    private serviceHistoryService: ServiceHistoryService,
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
    // Only need to initialize the form once, so remove this if already in constructor
    // this.addServiceForm = this.fb.group({
    //   title: ['', Validators.required],
    //   price: ['', Validators.required],
    //   technician: ['', Validators.required],
    //   vehicle: ['', Validators.required],
    //   date: ['', Validators.required],
    //   rating: ['', Validators.required]
    // });
  }

  openAddServiceModal(): void {
    console.log('Customer Dashboard: Opening modal...');
    console.log('Customer Dashboard: Current showAddServiceModal value:', this.showAddServiceModal);
    this.showAddServiceModal = true;
    console.log('Customer Dashboard: showAddServiceModal set to:', this.showAddServiceModal);
    this.addServiceForm.reset({
      title: '',
      price: 0,
      technician: '',
      vehicle: '',
      date: '',
      rating: 5,
    });
    console.log('Customer Dashboard: Modal should be visible now');
    
    // Force change detection
    setTimeout(() => {
      console.log('Customer Dashboard: Modal state after timeout:', this.showAddServiceModal);
    }, 100);
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
      console.log('Customer Dashboard: Adding new service with form data:', formValue);
      
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
      
      // Create new service object
      const newService = {
        id: Date.now(), // Generate unique ID
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

      // Add to service history using the service
      this.serviceHistoryService.addService(newService);
      console.log('Customer Dashboard: Service added to service history:', newService);
      
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
      console.log('Customer Dashboard: Adding order data to admin:', orderData);
      
      try {
        this.orderCommunicationService.addCustomerOrder(orderData);
        console.log('Customer Dashboard: Order data successfully sent to admin');
      } catch (error) {
        console.error('Customer Dashboard: Error sending order data to admin:', error);
      }
      
      // Close modal and reset form
      this.closeAddServiceModal();
    } else {
      console.log('Customer Dashboard: Form is invalid:', this.addServiceForm.errors);
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

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
