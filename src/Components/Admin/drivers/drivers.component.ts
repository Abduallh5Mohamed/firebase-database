import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drivers.component.html',
  styleUrl: './drivers.component.css',
})
export class DriversComponent {
  showAddDriverForm = false;
  showAddDriverModal = false;
  showDriverProfileModal = false;
  previewImage: string | null = null;
  selectedDriver: any = null;

  newDriver = {
    name: '',
    licenseNumber: '',
    experience: '',
    vehicleType: '',
    joined: '',
    rating: 0,
    totalTrips: 0,
    email: '',
    password: '',
    image: ''
  };

  constructor(private authService: AuthService) {}

  drivers = [
    {
      id: 1,
      name: 'Mahmoud Reda',
      licenseNumber: 'EG-DL-123456',
      experience: '5 Years',
      image: './assets/dashboard-img/fr1.jpg',
      joined: 'Jan 2022',
      rating: 4.8,
      totalTrips: 1250,
      vehicleType: 'Sedan',
      email: 'mahmoud@example.com',
      password: '****'
    },
    {
      id: 2,
      name: 'Omar Khaled',
      licenseNumber: 'EG-DL-789012',
      experience: '3 Years',
      image: './assets/dashboard-img/fr2.jpg',
      joined: 'May 2023',
      rating: 4.6,
      totalTrips: 890,
      vehicleType: 'SUV',
      email: 'omar@example.com',
      password: '****'
    },
    {
      id: 3,
      name: 'Hassan Ali',
      licenseNumber: 'EG-DL-345678',
      experience: '7 Years',
      image: './assets/dashboard-img/fr3.jpg',
      joined: 'Aug 2021',
      rating: 4.9,
      totalTrips: 2100,
      vehicleType: 'Pickup',
      email: 'hassan@example.com',
      password: '****'
    },
    {
      id: 4,
      name: 'Ahmed Nasser',
      licenseNumber: 'EG-DL-901234',
      experience: '2 Years',
      image: './assets/dashboard-img/fr4.jpg',
      joined: 'Oct 2023',
      rating: 4.4,
      totalTrips: 520,
      vehicleType: 'Sedan',
      email: 'ahmed@example.com',
      password: '****'
    },
    {
      id: 5,
      name: 'Youssef Ibrahim',
      licenseNumber: 'EG-DL-567890',
      experience: '4 Years',
      image: './assets/dashboard-img/fr5.jpg',
      joined: 'Dec 2022',
      rating: 4.7,
      totalTrips: 950,
      vehicleType: 'Van',
      email: 'youssef@example.com',
      password: '****'
    },
    {
      id: 6,
      name: 'Karim Fouad',
      licenseNumber: 'EG-DL-234567',
      experience: '6 Years',
      image: './assets/dashboard-img/fr6.jpg',
      joined: 'Mar 2021',
      rating: 4.8,
      totalTrips: 1680,
      vehicleType: 'SUV',
      email: 'karim@example.com',
      password: '****'
    },
    {
      id: 7,
      name: 'Tamer Said',
      licenseNumber: 'EG-DL-678901',
      experience: '8 Years',
      image: './assets/dashboard-img/fr7.jpg',
      joined: 'Jun 2020',
      rating: 5.0,
      totalTrips: 2850,
      vehicleType: 'Pickup',
      email: 'tamer@example.com',
      password: '****'
    },
    {
      id: 8,
      name: 'Mostafa Ahmed',
      licenseNumber: 'EG-DL-012345',
      experience: '3 Years',
      image: './assets/dashboard-img/fr8.jpg',
      joined: 'Sep 2023',
      rating: 4.5,
      totalTrips: 720,
      vehicleType: 'Sedan',
      email: 'mostafa@example.com',
      password: '****'
    },
  ];

  // ===== ADD DRIVER MODAL FUNCTIONS =====
  toggleAddDriverForm() {
    this.showAddDriverForm = !this.showAddDriverForm;
  }

  openAddDriverModal() {
    this.showAddDriverModal = true;
  }

  closeAddDriverModal() {
    this.showAddDriverModal = false;
    this.previewImage = null; // مسح المعاينة عند الغلق
    this.resetNewDriverForm();
  }

  // ===== DRIVER PROFILE MODAL FUNCTIONS =====
  viewDriverProfile(driver: any) {
    this.selectedDriver = driver;
    this.showDriverProfileModal = true;
  }

  closeDriverProfileModal() {
    this.showDriverProfileModal = false;
    this.selectedDriver = null;
  }

  // Contact functions for the profile modal
  contactDriver(driver: any) {
    this.showSuccessMessage(`Contacting ${driver.name} at ${driver.email}`);
    // يمكنك إضافة منطق الاتصال هنا
    console.log('Contacting driver:', driver);
  }

  sendMessage(driver: any) {
    this.showSuccessMessage(`Message sent to ${driver.name}`);
    // يمكنك إضافة منطق إرسال الرسالة هنا
    console.log('Sending message to driver:', driver);
  }

  // ===== IMAGE HANDLING =====
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        this.showErrorMessage('Please select a valid image file');
        return;
      }
      
      // التحقق من حجم الملف (أقل من 5 ميجا)
      if (file.size > 5 * 1024 * 1024) {
        this.showErrorMessage('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // ===== ADD DRIVER FUNCTION =====
  async addDriver() {
    // التحقق من صحة البيانات
    if (!this.validateDriverData()) {
      return;
    }

    try {
      // Create driver account in Firebase
      await this.authService.signUp(
        this.newDriver.email,
        this.newDriver.password,
        this.newDriver.name,
        'driver'
      );

      // Add to local drivers array for display
      const newDriverData = {
        ...this.newDriver,
        id: this.generateNewId(),
        image: this.previewImage || './assets/dashboard-img/default-avatar.jpg'
      };

      this.drivers.push(newDriverData);
      this.resetNewDriverForm();
      this.closeAddDriverModal();
      
      this.showSuccessMessage(`Driver ${this.newDriver.name} added successfully!`);
    } catch (error: any) {
      console.error('Error creating driver account:', error);
      this.showErrorMessage('Failed to create driver account. Please try again.');
    }
  }

  // ===== VALIDATION FUNCTIONS =====
  private validateDriverData(): boolean {
    if (!this.newDriver.name.trim()) {
      this.showErrorMessage('Driver name is required');
      return false;
    }

    if (!this.newDriver.licenseNumber.trim()) {
      this.showErrorMessage('License number is required');
      return false;
    }

    if (!this.newDriver.email.trim()) {
      this.showErrorMessage('Email address is required');
      return false;
    }

    if (!this.isValidEmail(this.newDriver.email)) {
      this.showErrorMessage('Please enter a valid email address');
      return false;
    }

    if (!this.newDriver.password || this.newDriver.password.length < 6) {
      this.showErrorMessage('Password must be at least 6 characters');
      return false;
    }

    if (this.newDriver.rating < 0 || this.newDriver.rating > 5) {
      this.showErrorMessage('Rating must be between 0 and 5');
      return false;
    }

    if (this.newDriver.totalTrips < 0) {
      this.showErrorMessage('Total trips cannot be negative');
      return false;
    }

    if (!this.previewImage) {
      this.showErrorMessage('Please select a driver image');
      return false;
    }

    // التحقق من عدم تكرار رقم الرخصة
    if (this.drivers.some(driver => driver.licenseNumber === this.newDriver.licenseNumber)) {
      this.showErrorMessage('License number already exists');
      return false;
    }

    // التحقق من عدم تكرار البريد الإلكتروني
    if (this.drivers.some(driver => driver.email === this.newDriver.email)) {
      this.showErrorMessage('Email address already exists');
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ===== UTILITY FUNCTIONS =====
  private generateNewId(): number {
    return Math.max(...this.drivers.map(d => d.id)) + 1;
  }

  private resetNewDriverForm() {
    this.newDriver = {
      name: '',
      licenseNumber: '',
      experience: '',
      vehicleType: '',
      joined: '',
      rating: 0,
      totalTrips: 0,
      email: '',
      password: '',
      image: ''
    };
    this.previewImage = null;
  }

  // ===== NOTIFICATION FUNCTIONS =====
  private showErrorMessage(message: string) {
      Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
  });
  }

  private showSuccessMessage(message: string) {
      Swal.fire({
    icon: 'success',
    title: 'Success',
    text: message,
    timer: 2000,
    showConfirmButton: false
  });
  }

  private createNotification(message: string, type: 'success' | 'error') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${icon}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.remove();
      }
    }, 4000);
  }

  // ===== EXISTING FUNCTIONS =====
callDriver(driver: any) {
  Swal.fire({
    icon: 'info',
    title: 'Driver Info',
    text: `License: ${driver.licenseNumber} - ${driver.experience} experience`,
    timer: 3000,
    showConfirmButton: false
  });
}

emailDriver(driver: any) {
  Swal.fire({
    icon: 'info',
    title: 'Driver Stats',
    text: `${driver.name} has completed ${driver.totalTrips} trips with ${driver.rating}⭐ rating`,
    timer: 3000,
    showConfirmButton: false
  });
}


 removeDriver(driver: any) {
  Swal.fire({
    title: `Are you sure you want to remove ${driver.name}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, remove it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.drivers = this.drivers.filter((d) => d.id !== driver.id);
      this.showSuccessMessage(`${driver.name} has been removed successfully`);
    }
  });
}


  togglePasswordVisibility() {
    const passwordInput = document.getElementById('passwordField') as HTMLInputElement;
    const toggleIcon = document.getElementById('togglePassword') as HTMLElement;

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.classList.remove('fa-eye');
      toggleIcon.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      toggleIcon.classList.remove('fa-eye-slash');
      toggleIcon.classList.add('fa-eye');
    }
  }
}