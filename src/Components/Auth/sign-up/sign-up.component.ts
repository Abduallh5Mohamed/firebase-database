import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  signUpForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength: PasswordStrength = { score: 0, feedback: [], color: '#e0e0e0' };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Listen to password changes to update strength indicator
    this.signUpForm.get('password')?.valueChanges.subscribe(value => {
      this.updatePasswordStrength(value);
    });
  }

  // Password match validator
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Strong password validator
  strongPasswordValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      if (!password) return null;

      const errors: ValidationErrors = {};
      const feedback: string[] = [];

      // Check minimum length
      if (password.length < 8) {
        errors['minLength'] = true;
        feedback.push('At least 8 characters');
      }

      // Check for uppercase letter
      if (!/[A-Z]/.test(password)) {
        errors['noUppercase'] = true;
        feedback.push('At least one uppercase letter');
      }

      // Check for lowercase letter
      if (!/[a-z]/.test(password)) {
        errors['noLowercase'] = true;
        feedback.push('At least one lowercase letter');
      }

      // Check for number
      if (!/\d/.test(password)) {
        errors['noNumber'] = true;
        feedback.push('At least one number');
      }

      // Check for special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors['noSpecialChar'] = true;
        feedback.push('At least one special character');
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  // Update password strength indicator
  updatePasswordStrength(password: string) {
    if (!password) {
      this.passwordStrength = { score: 0, feedback: [], color: '#e0e0e0' };
      return;
    }

    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

    // Determine color and feedback
    let color = '#e0e0e0';
    if (score <= 2) {
      color = '#ff4444';
      feedback.push('Weak password');
    } else if (score <= 4) {
      color = '#ffa726';
      feedback.push('Fair password');
    } else if (score <= 5) {
      color = '#ffeb3b';
      feedback.push('Good password');
    } else {
      color = '#4caf50';
      feedback.push('Strong password');
    }

    this.passwordStrength = { score, feedback, color };
  }

  async onSubmit() {
    if (this.signUpForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { email, password, displayName } = this.signUpForm.value;
        await this.authService.signUp(email, password, displayName);
        this.router.navigate(['/auth/pending-verification']);
      } catch (error: any) {
        this.errorMessage = error;
      } finally {
        this.isLoading = false;
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.signUpForm.controls).forEach(key => {
        this.signUpForm.get(key)?.markAsTouched();
      });
    }
  }

  async signUpWithGoogle() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.signInWithGoogle();

      const userRole = this.authService.getUserRole();

      if (userRole === 'admin') {
        this.router.navigate(['/admin']);
      } else if (userRole === 'technician') {
        this.router.navigate(['/technician/dashboard']);
      } else if (userRole === 'driver') {
        this.router.navigate(['/driver/dashboard']);
      } else {
        this.router.navigate(['/customer/dashboard']);
      }
    } catch (error: any) {
      this.errorMessage = error;
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getFieldError(fieldName: string): string {
    const field = this.signUpForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        if (fieldName === 'displayName') return 'Display name is required';
        if (fieldName === 'acceptTerms') return 'You must accept the terms and conditions';
        return `${fieldName} is required`;
      }
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        if (fieldName === 'displayName') return `Display name must be at least ${requiredLength} characters`;
        if (fieldName === 'password') return `Password must be at least ${requiredLength} characters`;
        return `${fieldName} must be at least ${requiredLength} characters`;
      }
      if (field.errors['requiredTrue']) return 'You must accept the terms and conditions';

      // Password strength validation errors
      if (fieldName === 'password') {
        if (field.errors['noUppercase']) return 'Password must contain at least one uppercase letter';
        if (field.errors['noLowercase']) return 'Password must contain at least one lowercase letter';
        if (field.errors['noNumber']) return 'Password must contain at least one number';
        if (field.errors['noSpecialChar']) return 'Password must contain at least one special character';
      }
    }

    // Check for password mismatch at form level
    if (fieldName === 'confirmPassword' && this.signUpForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }

    return '';
  }

  // Helper methods for password requirements
  hasUppercase(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  hasLowercase(password: string): boolean {
    return /[a-z]/.test(password);
  }

  hasNumber(password: string): boolean {
    return /\d/.test(password);
  }

  hasSpecialChar(password: string): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  }

  hasMinLength(password: string): boolean {
    return password.length >= 8;
  }
}