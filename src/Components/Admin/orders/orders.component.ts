import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../Services/theme.service';
import { Subscription } from 'rxjs';
import { OrderCommunicationService, CustomerOrder } from '../../../Services/order-communication.service';

interface Order {
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

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit, OnDestroy {
  private themeSubscription?: Subscription;
  private orderSubscription?: Subscription;
  isDarkMode = false;

  // Start with 12 orders - #001 through #012
  orders: Order[] = [
    {
      id: '#001',
      date: '15 Aug, 2024',
      customer: 'Ahmed Hassan',
      payment: 'Success',
      total: 850.0,
      delivery: 'Cairo',
      items: 3,
      fulfillment: 'Fulfilled',
      serviceType: 'Engine Service',
      vehicle: 'BMW X6',
      technician: 'Mohamed Ali'
    },
    {
      id: '#002',
      date: '14 Aug, 2024',
      customer: 'Fatima Mohamed',
      payment: 'Pending',
      total: 620.0,
      delivery: 'Alexandria',
      items: 2,
      fulfillment: 'Unfulfilled',
      serviceType: 'Brake Service',
      vehicle: 'Toyota Camry',
      technician: 'Ahmed Hassan'
    },
    {
      id: '#003',
      date: '13 Aug, 2024',
      customer: 'Omar Ibrahim',
      payment: 'Success',
      total: 1250.0,
      delivery: 'Giza',
      items: 5,
      fulfillment: 'Fulfilled',
      serviceType: 'Oil Change',
      vehicle: 'Honda Civic',
      technician: 'Sarah Johnson'
    },
    {
      id: '#004',
      date: '12 Aug, 2024',
      customer: 'Aisha Ali',
      payment: 'Success',
      total: 450.0,
      delivery: 'Luxor',
      items: 1,
      fulfillment: 'Fulfilled',
      serviceType: 'Tire Rotation',
      vehicle: 'Ford Focus',
      technician: 'Michael Brown'
    },
    {
      id: '#005',
      date: '11 Aug, 2024',
      customer: 'Mohamed Saeed',
      payment: 'Pending',
      total: 730.0,
      delivery: 'Aswan',
      items: 4,
      fulfillment: 'Unfulfilled',
      serviceType: 'Brake Inspection',
      vehicle: 'Nissan Altima',
      technician: 'Emily Davis'
    },
    {
      id: '#006',
      date: '10 Aug, 2024',
      customer: 'Nour Mahmoud',
      payment: 'Success',
      total: 920.0,
      delivery: 'Mansoura',
      items: 3,
      fulfillment: 'Fulfilled',
      serviceType: 'Air Conditioning',
      vehicle: 'Chevrolet Malibu',
      technician: 'David Wilson'
    },
    {
      id: '#007',
      date: '9 Aug, 2024',
      customer: 'Youssef Khaled',
      payment: 'Pending',
      total: 380.0,
      delivery: 'Tanta',
      items: 2,
      fulfillment: 'Unfulfilled',
      serviceType: 'Battery Replacement',
      vehicle: 'Hyundai Sonata',
      technician: 'Lisa Anderson'
    },
    {
      id: '#008',
      date: '8 Aug, 2024',
      customer: 'Maryam Adel',
      payment: 'Success',
      total: 1100.0,
      delivery: 'Ismailia',
      items: 4,
      fulfillment: 'Fulfilled',
      serviceType: 'Transmission Service',
      vehicle: 'Kia Optima',
      technician: 'Robert Taylor'
    },
    {
      id: '#009',
      date: '7 Aug, 2024',
      customer: 'Karim Nasser',
      payment: 'Pending',
      total: 550.0,
      delivery: 'Suez',
      items: 2,
      fulfillment: 'Unfulfilled',
      serviceType: 'Spark Plug Replacement',
      vehicle: 'Mazda 6',
      technician: 'Jennifer Martinez'
    },
    {
      id: '#010',
      date: '6 Aug, 2024',
      customer: 'Dina Fouad',
      payment: 'Success',
      total: 675.0,
      delivery: 'Port Said',
      items: 3,
      fulfillment: 'Fulfilled',
      serviceType: 'Wheel Alignment',
      vehicle: 'Subaru Legacy',
      technician: 'William Garcia'
    },
    {
      id: '#011',
      date: '5 Aug, 2024',
      customer: 'Amr Hosny',
      payment: 'Pending',
      total: 820.0,
      delivery: 'Damanhur',
      items: 4,
      fulfillment: 'Unfulfilled',
      serviceType: 'Fuel System Cleaning',
      vehicle: 'Volkswagen Passat',
      technician: 'Amanda Rodriguez'
    },
    {
      id: '#012',
      date: '4 Aug, 2024',
      customer: 'Salma Rashid',
      payment: 'Success',
      total: 490.0,
      delivery: 'Minya',
      items: 2,
      fulfillment: 'Fulfilled',
      serviceType: 'Coolant Flush',
      vehicle: 'Audi A4',
      technician: 'James Lopez'
    }
  ];

  // Statistics
  totalOrders = 12; // Updated to reflect 12 orders
  orderItems = 35; // Updated to reflect total items from 12 orders
  returnOrders = 4; // Updated to reflect pending orders
  fulfilledOrders = 8; // Updated to reflect fulfilled orders
  selectedAction = 'More actions';

  filters = ['All', 'Unfulfilled', 'Unpaid', 'Closed'];
  selectedFilter = 'All';
  filteredOrders: Order[] = [];

  showMoreActions = false;
  showDateDropdown = false;
  selectedDateRange = 'Aug 1 - Aug 6, 2024';

  // Array of random customer names for generating different names each time
  private customerNames = [
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

  constructor(
    private themeService: ThemeService,
    private orderCommunicationService: OrderCommunicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize filteredOrders with the current orders
    this.filteredOrders = [...this.orders];
    console.log('Admin Orders Component initialized with', this.orders.length, 'orders');
    console.log('Admin Orders: Initial filtered orders:', this.filteredOrders.length);

    // Check for and remove any existing duplicates
    const uniqueIds = new Set(this.orders.map(order => order.id));
    if (uniqueIds.size !== this.orders.length) {
      console.log('Admin Orders: Found duplicates, removing them...');
      this.removeDuplicateOrders();
    }

    // Check service status
    this.orderCommunicationService.checkServiceStatus();

    // Load any persisted customer orders from localStorage
    this.loadPersistedOrders();

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(
      (isDark) => (this.isDarkMode = isDark)
    );

    // Subscribe to new customer orders from the service
    this.orderSubscription = this.orderCommunicationService.getCustomerOrders().subscribe(
      (customerOrders) => {
        console.log('=== ADMIN ORDERS SUBSCRIPTION TRIGGERED ===');
        console.log('Admin Orders: Received customer orders:', customerOrders);
        
        if (customerOrders && Array.isArray(customerOrders)) {
          console.log('Admin Orders: Processing', customerOrders.length, 'customer orders');
          
          // Find new orders that don't exist in our current orders
          const newOrders: Order[] = [];
          const existingIds = new Set(this.orders.map(order => order.id));
          
          customerOrders.forEach((customerOrder, index) => {
            console.log(`Admin Orders: Processing customer order ${index + 1}:`, customerOrder);
            
            // Generate a random customer name
            const randomCustomerName = this.getRandomCustomerName();
            
            // Create new admin order with all required fields
            const newAdminOrder: Order = {
              id: this.generateSequentialId(), // Use sequential ID
              date: customerOrder.date || this.formatDate(new Date()),
              customer: randomCustomerName, // Use random customer name instead of actual data
              payment: customerOrder.payment || this.getRandomPaymentStatus(),
              total: customerOrder.total || 0,
              delivery: customerOrder.delivery || 'Unknown Location',
              items: customerOrder.items || 1,
              fulfillment: customerOrder.fulfillment || 'Unfulfilled',
              serviceType: customerOrder.serviceType,
              vehicle: customerOrder.vehicle,
              technician: customerOrder.technician
            };
            
            // Check if this order ID already exists
            if (!existingIds.has(newAdminOrder.id)) {
              newOrders.push(newAdminOrder);
              existingIds.add(newAdminOrder.id); // Add to set to prevent duplicates within this batch
              console.log('Admin Orders: New order created and will be added:', newAdminOrder);
            } else {
              console.log('Admin Orders: Skipping duplicate order ID:', newAdminOrder.id);
            }
          });
          
          // Add all new orders to the END of the array
          if (newOrders.length > 0) {
            console.log('Admin Orders: Adding', newOrders.length, 'new orders to admin');
            
            // Append new orders at the bottom
            this.orders = [...this.orders, ...newOrders];
            
            // Update filteredOrders to reflect the new orders
            this.updateFilteredOrders();
            
            // Update statistics
            this.updateStatistics();
            
            console.log('Admin Orders: Total admin orders now:', this.orders.length);
            console.log('Admin Orders: Filtered orders count:', this.filteredOrders.length);
            console.log('Admin Orders: New orders added to UI:', newOrders);
            
            // Force change detection to update the UI immediately
            this.cdr.detectChanges();
            console.log('=== CHANGE DETECTION TRIGGERED ===');
          } else {
            console.log('Admin Orders: No new orders to add');
          }
        } else {
          console.log('Admin Orders: No customer orders received or invalid data');
        }
        console.log('=== END ADMIN ORDERS SUBSCRIPTION ===');
      },
      (error) => {
        console.error('Admin Orders: Error receiving customer orders:', error);
      }
    );

    // Force refresh to ensure we get the latest data
    setTimeout(() => {
      this.orderCommunicationService.forceRefresh();
    }, 1000);
  }

  // Generate sequential ID starting from #013 (since we have 12 existing orders)
  private generateSequentialId(): string {
    // Find the highest existing ID number
    const existingIds = this.orders.map(order => {
      const match = order.id.match(/#(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    
    const maxId = Math.max(0, ...existingIds);
    const nextId = maxId + 1;
    
    // Format as #001, #002, etc.
    return `#${nextId.toString().padStart(3, '0')}`;
  }

  // Generate a random customer name
  private getRandomCustomerName(): string {
    const randomIndex = Math.floor(Math.random() * this.customerNames.length);
    return this.customerNames[randomIndex];
  }

  // Generate random payment status
  private getRandomPaymentStatus(): 'Pending' | 'Success' {
    return Math.random() > 0.5 ? 'Success' : 'Pending';
  }

  // Load persisted orders from localStorage
  private loadPersistedOrders(): void {
    try {
      const raw = localStorage.getItem('customerOrders');
      if (raw) {
        const persisted = JSON.parse(raw);
        if (Array.isArray(persisted) && persisted.length > 0) {
          console.log('Admin Orders: Loaded persisted customer orders from localStorage:', persisted);
          
          const toAdd: Order[] = [];
          const existingIds = new Set(this.orders.map(order => order.id));
          
          persisted.forEach((co: any) => {
            // Generate a random customer name for persisted orders too
            const randomCustomerName = this.getRandomCustomerName();
            
            const mapped: Order = {
              id: this.generateSequentialId(), // Use sequential ID instead of co.id
              date: co.date || this.formatDate(new Date()),
              customer: randomCustomerName, // Use random customer name
              payment: co.payment || this.getRandomPaymentStatus(),
              total: co.total || 0,
              delivery: co.delivery || 'Unknown Location',
              items: co.items || 1,
              fulfillment: co.fulfillment || 'Unfulfilled',
              serviceType: co.serviceType,
              vehicle: co.vehicle,
              technician: co.technician
            };
            
            // Check if this order ID already exists
            if (!existingIds.has(mapped.id)) {
              toAdd.push(mapped);
              existingIds.add(mapped.id); // Add to set to prevent duplicates within this batch
            } else {
              console.log('Admin Orders: Skipping duplicate persisted order ID:', mapped.id);
            }
          });
          
          if (toAdd.length > 0) {
            this.orders = [...this.orders, ...toAdd];
            this.updateFilteredOrders();
            this.updateStatistics();
            this.cdr.detectChanges();
            console.log('Admin Orders: Added', toAdd.length, 'persisted orders on init');
          }
        }
      }
    } catch (e) {
      console.warn('Admin Orders: Failed to read persisted customer orders:', e);
    }
  }

  // Update statistics based on current orders
  private updateStatistics(): void {
    this.totalOrders = this.orders.length;
    this.orderItems = this.orders.reduce((sum, order) => sum + order.items, 0);
    this.fulfilledOrders = this.orders.filter(order => order.fulfillment === 'Fulfilled').length;
    this.returnOrders = this.orders.filter(order => order.payment === 'Pending').length;
  }

  // Clear imported customer orders (those with ids starting with '#C')
  clearImportedOrders(): void {
    try {
      this.orderCommunicationService.clearCustomerOrders();
    } catch (e) {
      console.warn('Admin Orders: Failed to clear orders in service:', e);
    }
    // Remove from current view as well
    const before = this.orders.length;
    this.orders = this.orders.filter(o => !o.id.startsWith('#C'));
    this.updateFilteredOrders();
    this.updateStatistics();
    this.cdr.detectChanges();
    console.log(`Admin Orders: Cleared imported orders. Before: ${before}, After: ${this.orders.length}`);
  }

  // Remove duplicate orders based on ID
  removeDuplicateOrders(): void {
    const before = this.orders.length;
    const uniqueOrders: Order[] = [];
    const seenIds = new Set<string>();
    
    for (const order of this.orders) {
      if (!seenIds.has(order.id)) {
        seenIds.add(order.id);
        uniqueOrders.push(order);
      } else {
        console.log(`Admin Orders: Removing duplicate order: ${order.id}`);
      }
    }
    
    this.orders = uniqueOrders;
    this.updateFilteredOrders();
    this.updateStatistics();
    this.cdr.detectChanges();
    console.log(`Admin Orders: Removed duplicate orders. Before: ${before}, After: ${this.orders.length}`);
  }

  // Clear all modal-inserted orders (keep only #001 through #012)
  clearModalOrders(): void {
    const before = this.orders.length;
    
    // Clear localStorage
    try {
      localStorage.removeItem('customerOrders');
      console.log('Admin Orders: Cleared customerOrders from localStorage');
    } catch (e) {
      console.warn('Admin Orders: Failed to clear localStorage:', e);
    }
    
    // Clear service internal state
    try {
      this.orderCommunicationService.clearCustomerOrders();
      console.log('Admin Orders: Cleared service internal state');
    } catch (e) {
      console.warn('Admin Orders: Failed to clear service state:', e);
    }
    
    // Keep only orders #001 through #012
    this.orders = this.orders.filter(order => {
      const match = order.id.match(/#(\d+)/);
      if (match) {
        const orderNumber = parseInt(match[1]);
        return orderNumber >= 1 && orderNumber <= 12;
      }
      return false;
    });
    
    this.updateFilteredOrders();
    this.updateStatistics();
    this.cdr.detectChanges();
    console.log(`Admin Orders: Cleared modal orders. Before: ${before}, After: ${this.orders.length}`);
  }

  // Helper method to update filtered orders based on current filter
  private updateFilteredOrders(): void {
    if (this.selectedFilter === 'All') {
      this.filteredOrders = this.orders;
    } else if (this.selectedFilter === 'Unfulfilled') {
      this.filteredOrders = this.orders.filter(
        (o) => o.fulfillment === 'Unfulfilled'
      );
    } else if (this.selectedFilter === 'Unpaid') {
      this.filteredOrders = this.orders.filter((o) => o.payment === 'Pending');
    } else if (this.selectedFilter === 'Closed') {
      this.filteredOrders = [];
    }
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.updateFilteredOrders();
  }

  toggleMoreActions(): void {
    this.showMoreActions = !this.showMoreActions;
  }

  toggleDateDropdown(): void {
    this.showDateDropdown = !this.showDateDropdown;
  }

  selectDateRange(range: string): void {
    this.selectedDateRange = range;
    this.showDateDropdown = false;
    // Here you could implement actual date filtering logic
  }

  createOrder(): void {
    console.log('Create new order');
    // Implementation for creating new order
  }

  exportOrders(): void {
    console.log('Export orders');
    // Implementation for exporting orders
  }

  viewOrder(orderId: string): void {
    console.log('View order:', orderId);
    // Implementation for viewing order details
  }

  editOrder(orderId: string): void {
    console.log('Edit order:', orderId);
    // Implementation for editing order
  }

  deleteOrder(orderId: string): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orders = this.orders.filter((order) => order.id !== orderId);
      this.updateFilteredOrders();
      this.updateStatistics();
      this.cdr.detectChanges();
      console.log('Order deleted:', orderId);
    }
  }

  selectMoreAction(action: string): void {
    this.selectedAction = action;
    this.showMoreActions = false;

    switch (action) {
      case 'Export CSV':
        this.exportOrders();
        break;
      case 'Create Order':
        this.createOrder();
        break;
      case 'Clear Modal Orders':
        if (confirm('Are you sure you want to clear all modal-inserted orders? This will keep only the initial 12 orders (#001-#012).')) {
          this.clearModalOrders();
        }
        break;
      case 'Remove Duplicate Orders':
        if (confirm('Are you sure you want to remove all duplicate orders? This will keep only unique orders based on ID.')) {
          this.removeDuplicateOrders();
        }
        break;
      default:
        console.log('Selected action:', action);
    }
  }

  // Close dropdowns when clicking outside
  closeDropdowns(): void {
    this.showMoreActions = false;
    this.showDateDropdown = false;
  }

  // Track by function for better performance
  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }

  // Helper method to format date
  private formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  }
}
