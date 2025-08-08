import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-technicians',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './technicians.component.html',
  styleUrls: ['./technicians.component.css']
})
export class TechniciansComponent {
  constructor(private authService: AuthService) {}

  showAddTechnicianModal = false;
  showProfileModal = false;
  showPassword = false;
  selectedFilter = 'All';
  filters = ['All', 'Available', 'Busy', 'On Break'];
  isDarkMode = false;

  previewImage: string | null = null;
  selectedTechnician: any = null;

  newTechnician = {
    name: '',
    specialty: '',
    certification: '',
    experience: '',
    joined: '',
    status: 'Available',
    rating: 0,
    completedJobs: 0,
    email: '',
    password: '',
    image: ''
  };

  statusOptions = [
    { value: 'Available', label: 'Available', class: 'available' },
    { value: 'Busy', label: 'Busy', class: 'busy' },
    { value: 'On Break', label: 'On Break', class: 'on-break' }
  ];

  technicians = [
    {
      id: 1,
      name: 'Mohamed Hassan',
      specialty: 'Engine Repair',
      certification: 'ASE Certified',
      image: './assets/technicians-img/tech1.jpg',
      joined: 'Aug 2021',
      experience: '8 Years',
      status: 'Available',
      rating: 4.9,
      completedJobs: 450,
      email: 'mohamed@example.com',
      password: '****'
    },
    {
      id: 2,
      name: 'Ahmed Farouk',
      specialty: 'Brake Service',
      certification: 'Master Tech',
      image: './assets/technicians-img/tech2.jpg',
      joined: 'Mar 2021',
      experience: '6 Years',
      status: 'Busy',
      rating: 4.7,
      completedJobs: 380,
      email: 'ahmed@example.com',
      password: '****'
    },
    {
      id: 3,
      name: 'Omar El-Sayed',
      specialty: 'Transmission',
      certification: 'Certified Tech',
      image: './assets/technicians-img/tech3.jpg',
      joined: 'Nov 2021',
      experience: '5 Years',
      status: 'Available',
      rating: 4.8,
      completedJobs: 320,
      email: 'omar@example.com',
      password: '****'
    },
    {
      id: 4,
      name: 'Youssef Mahmoud',
      specialty: 'Electrical',
      certification: 'Master Tech',
      image: './assets/technicians-img/tech4.jpg',
      joined: 'Jul 2022',
      experience: '4 Years',
      status: 'On Break',
      rating: 4.6,
      completedJobs: 280,
      email: 'youssef@example.com',
      password: '****'
    },
    {
      id: 5,
      name: 'Khaled Ibrahim',
      specialty: 'Suspension',
      certification: 'ASE Certified',
      image: './assets/technicians-img/tech5.jpg',
      joined: 'May 2021',
      experience: '7 Years',
      status: 'Available',
      rating: 4.9,
      completedJobs: 420,
      email: 'khaled@example.com',
      password: '****'
    },
    {
      id: 6,
      name: 'Mahmoud Ali',
      specialty: 'AC Repair',
      certification: 'Certified Tech',
      image: './assets/technicians-img/tech6.jpg',
      joined: 'Mar 2022',
      experience: '3 Years',
      status: 'Busy',
      rating: 4.5,
      completedJobs: 190,
      email: 'mahmoud.ali@example.com',
      password: '****'
    },
    {
      id: 7,
      name: 'Hassan Nasser',
      specialty: 'Tire Service',
      certification: 'Master Tech',
      image: './assets/technicians-img/tech7.jpg',
      joined: 'Nov 2022',
      experience: '2 Years',
      status: 'Available',
      rating: 4.4,
      completedJobs: 150,
      email: 'hassan@example.com',
      password: '****'
    },
    {
      id: 8,
      name: 'Ali Mostafa',
      specialty: 'Body Work',
      certification: 'Certified Tech',
      image: './assets/technicians-img/tech8.jpg',
      joined: 'Jul 2022',
      experience: '3 Years',
      status: 'On Break',
      rating: 4.6,
      completedJobs: 210,
      email: 'ali@example.com',
      password: '****'
    },
  ];

  // Filter functionality methods - المضاف الجديد
  get filteredTechnicians() {
    if (this.selectedFilter === 'All') {
      return this.technicians;
    }
    return this.technicians.filter(tech => tech.status === this.selectedFilter);
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
  }

  getStatusCount(status: string): number {
    if (status === 'All') {
      return this.technicians.length;
    }
    return this.technicians.filter(tech => tech.status === status).length;
  }

  openAddTechnicianModal() {
    this.showAddTechnicianModal = true;
  }

  closeAddTechnicianModal() {
    this.showAddTechnicianModal = false;
    this.previewImage = null;
    this.showPassword = false;
  }

  viewTechnicianProfile(tech: any) {
    this.selectedTechnician = tech;
    this.showProfileModal = true;
    this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.selectedTechnician = null;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async addTechnician() {
    if (
      !this.newTechnician.name ||
      !this.newTechnician.specialty ||
      !this.newTechnician.certification ||
      !this.newTechnician.experience ||
      !this.newTechnician.joined ||
      !this.newTechnician.rating ||
      !this.newTechnician.completedJobs ||
      !this.newTechnician.email ||
      !this.newTechnician.password ||
      !this.previewImage
    ) {
     this.showErrorMessage('Please fill in all required fields');
      return;
    }

    try {
      await this.authService.signUp(
        this.newTechnician.email,
        this.newTechnician.password,
        this.newTechnician.name,
        'technician'
      );

      const newTechnicianData = {
        ...this.newTechnician,
        id: this.technicians.length + 1,
        image: this.previewImage
      };

      this.technicians.push(newTechnicianData);

      this.newTechnician = {
        name: '',
        specialty: '',
        certification: '',
        experience: '',
        joined: '',
        status: 'Available',
        rating: 0,
        completedJobs: 0,
        email: '',
        password: '',
        image: ''
      };
      this.previewImage = null;
      this.showPassword = false;

      this.closeAddTechnicianModal();
      
      this.showSuccessMessage('Technician account created successfully!');
    } catch (error: any) {
      console.error('Error creating technician account:', error);
      this.showErrorMessage('Failed to create technician account. Please try again.');
    }
  }

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
    showConfirmButton: false,
  });
  }
  
  callTechnician(tech: any) {
Swal.fire({
  icon: 'info',
  title: 'Technician Info',
  html: `Certification: <b>${tech.certification}</b><br>Specialty: <b>${tech.specialty}</b><br>Experience: <b>${tech.experience}</b>`
});
  }

  emailTechnician(tech: any) {
Swal.fire({
  icon: 'info',
  title: 'Technician Stats',
  html: `<b>${tech.name}</b> has completed <b>${tech.completedJobs}</b> jobs with a rating of <b>${tech.rating}⭐</b>`
});
  }

  removeTechnician(tech: any) {
   Swal.fire({
  title: `Are you sure you want to remove ${tech.name}?`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes, remove it!',
  cancelButtonText: 'Cancel'
}).then((result) => {
  if (result.isConfirmed) {
    this.technicians = this.technicians.filter((t) => t.id !== tech.id);
    this.showSuccessMessage(`${tech.name} has been removed successfully`);
  }
});
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
} 