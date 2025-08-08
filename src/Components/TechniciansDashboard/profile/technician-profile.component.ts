import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-technician-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './technician-profile.component.html',
  styleUrl: './technician-profile.component.css'
})
export class TechnicianProfileComponent implements OnInit {
  technicianForm!: FormGroup;
  isEditing: boolean = false;
  originalData: any = {};
  
  years: number[] = [];
  specializations: string[] = [
    'Engine Repair',
    'Transmission',
    'Brake System',
    'Electrical System',
    'Air Conditioning',
    'Body Work',
    'Paint & Detailing',
    'Tire Services',
    'Oil Change',
    'General Maintenance'
  ];

  technicians: any[] = [];
  currentTechnician: any = {
    fullName: 'Ahmed Hassan',
    email: 'ahmed.hassan@email.com',
    phone: '+20 123 456 7890',
    completedServices: 156,
    specialization: 'Electrical',
    experience: 8,
    hourlyRate: 120,
    technicianType: 'Senior',
    workingArea: 'Downtown Area',
    address: '123 Main Street, Downtown Area, Cairo, Egypt',
    joinDate: '2022-03-15',
    lastService: '2024-08-01',
    rating: 4.8
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.technicianForm = this.fb.group({
      fullName: [this.currentTechnician.fullName, [Validators.required]],
      email: [this.currentTechnician.email, [Validators.required, Validators.email]],
      phone: [this.currentTechnician.phone, [Validators.required]],
      completedServices: [this.currentTechnician.completedServices, [Validators.required, Validators.min(0)]],
      specialization: [this.currentTechnician.specialization, [Validators.required]],
      experience: [this.currentTechnician.experience, [Validators.required, Validators.min(0)]],
      hourlyRate: [this.currentTechnician.hourlyRate, [Validators.required, Validators.min(50)]],
      technicianType: [this.currentTechnician.technicianType, [Validators.required]],
      workingArea: [this.currentTechnician.workingArea, [Validators.required]],
      address: [this.currentTechnician.address, [Validators.required]]
    });

    // Initially disable all form controls
    this.technicianForm.disable();
  }

  toggleEdit() {
  // هنفعل كل حقول الفورم عشان تقدري تعدليها
  Object.keys(this.technicianForm.controls).forEach(key => {
    this.technicianForm.get(key)?.enable();
  });

  // رسالة للمستخدم إن البيانات اتفتحت للتعديل
  alert('Data updated successfuly!');
}


  saveProfile() {
    if (this.technicianForm.valid) {
      // Update current technician data
      this.currentTechnician = { 
        ...this.currentTechnician, 
        ...this.technicianForm.value 
      };
      
      // Here you would typically send the data to your backend service
      console.log('Saving profile data:', this.currentTechnician);
      
      // Disable form controls
      this.technicianForm.disable();
      this.isEditing = false;
      
      // Show success message (you can implement a toast service or similar)
      alert('Profile updated successfully!');
      
      // You can also call your API service here
      // this.technicianService.updateTechnician(this.currentTechnician).subscribe(...)
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  

  private markFormGroupTouched() {
    Object.keys(this.technicianForm.controls).forEach(key => {
      const control = this.technicianForm.get(key);
      control?.markAsTouched();
    });
  }

  // Utility method to check if a field has errors
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.technicianForm.get(fieldName);
    if (errorType) {
      return !!(field?.hasError(errorType) && (field?.dirty || field?.touched));
    }
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  // Method to get error message for a field
  getErrorMessage(fieldName: string): string {
    const field = this.technicianForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('min')) {
      return `${fieldName} must be at least ${field.errors?.['min'].min}`;
    }
    return '';
  }
}