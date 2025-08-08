import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../Services/theme.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface Admin {
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'busy';
}

interface Notification {
  id: number;
  type:
  | 'service'
  | 'completion'
  | 'payment'
  | 'registration'
  | 'system'
  | 'feedback';
  message: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() isDarkMode: boolean = true; // Default to dark theme
  @Input() sidebarCollapsed: boolean = false;
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() themeToggle = new EventEmitter<void>();

  autoTheme: boolean = false;
  private destroy$ = new Subject<void>();

  showNotifications = false;
  showAdminDropdown = false;
  notificationCount = 8;
  hasNotifications = true;
  currentAdminIndex = 0;

  constructor(private themeService: ThemeService) { }

  ngOnInit() {
    // Sync with theme service
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        this.isDarkMode = isDark;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Handle escape key press to close dropdowns
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.showNotifications) {
      this.closeNotifications();
    }
    if (this.showAdminDropdown) {
      this.closeAdminDropdown();
    }
  }

  admins: Admin[] = [
    {
      name: 'Ahmed Allam',
      email: 'ahmed.allam@d2d.com',
      role: 'Super Admin',
      avatar: '/assets/dashboard-img/avatar.png',
      status: 'online',
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@d2d.com',
      role: 'Admin',
      avatar: '/assets/dashboard-img/team-02.png',
      status: 'away',
    },
    {
      name: 'Yousef Elbaz',
      email: 'yousef.elbaz@d2d.com',
      role: 'Manager',
      avatar: '/assets/dashboard-img/team-01.png',
      status: 'busy',
    },
  ];

  notifications: Notification[] = [
    {
      id: 1,
      type: 'service',
      message: 'New brake service request from Ahmed Ali',
      time: '2 minutes ago',
      priority: 'high',
    },
    {
      id: 2,
      type: 'completion',
      message: 'Oil change completed for BMW X5 - Customer: Sara Mohamed',
      time: '15 minutes ago',
      priority: 'medium',
    },
    {
      id: 3,
      type: 'payment',
      message: 'Payment received - 850 EGP for tire replacement',
      time: '1 hour ago',
      priority: 'low',
    },
    {
      id: 4,
      type: 'registration',
      message: 'New customer registered: Omar Khaled',
      time: '2 hours ago',
      priority: 'medium',
    },
    {
      id: 5,
      type: 'system',
      message: 'Daily backup completed successfully',
      time: '3 hours ago',
      priority: 'low',
    },
    {
      id: 6,
      type: 'feedback',
      message: 'Excellent service rating (5 stars) from Mona Hassan',
      time: '4 hours ago',
      priority: 'medium',
    },
    {
      id: 7,
      type: 'service',
      message: 'Engine diagnostic requested for Mercedes C200',
      time: '5 hours ago',
      priority: 'high',
    },
    {
      id: 8,
      type: 'completion',
      message: 'AC repair completed for Hyundai Elantra',
      time: '6 hours ago',
      priority: 'medium',
    },
  ];

  get currentAdmin(): Admin {
    return this.admins[this.currentAdminIndex];
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.sidebarToggle.emit();
  }

  toggleTheme(): void {
    console.log('Theme toggle clicked! Current mode:', this.isDarkMode);
    // Use theme service for centralized theme management
    this.themeService.toggleTheme();
    console.log('New theme mode:', this.themeService.isDarkMode);
    // Still emit for parent component compatibility
    this.themeToggle.emit();
  }

  selectTheme(theme: 'light' | 'dark' | 'auto'): void {
    console.log('Theme selected:', theme);

    switch (theme) {
      case 'light':
        this.autoTheme = false;
        if (this.isDarkMode) {
          this.themeService.toggleTheme();
        }
        break;
      case 'dark':
        this.autoTheme = false;
        if (!this.isDarkMode) {
          this.themeService.toggleTheme();
        }
        break;
      case 'auto':
        this.autoTheme = true;
        // Detect system preference
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        if (this.isDarkMode !== prefersDark) {
          this.themeService.toggleTheme();
        }
        break;
    }

    this.themeToggle.emit();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showAdminDropdown = false;
  }

  toggleAdminDropdown(): void {
    this.showAdminDropdown = !this.showAdminDropdown;
    this.showNotifications = false;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  closeAdminDropdown(): void {
    this.showAdminDropdown = false;
  }

  clearAllNotifications(): void {
    this.notifications = [];
    this.notificationCount = 0;
    this.hasNotifications = false;
  }

  dismissNotification(index: number): void {
    this.notifications.splice(index, 1);
    this.notificationCount = this.notifications.length;
    this.hasNotifications = this.notifications.length > 0;
  }

  switchAdmin(index: number): void {
    if (index !== this.currentAdminIndex) {
      this.currentAdminIndex = index;
      console.log('Switched to admin:', this.currentAdmin.name);

      // Add switching animation
      const profileSelector = document.querySelector(
        '.profile-selector'
      ) as HTMLElement;
      if (profileSelector) {
        profileSelector.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
          profileSelector.style.animation = '';
        }, 500);
      }

      // Close dropdown after switching
      setTimeout(() => {
        this.showAdminDropdown = false;
      }, 800);
    }
  }

  viewCurrentAdminProfile(): void {
    console.log('Viewing profile for:', this.currentAdmin.name);
    this.showAdminDropdown = false;
    // Add profile viewing logic here
  }

  editProfile(): void {
    console.log('Editing profile...');
    this.showAdminDropdown = false;
    // Add edit profile modal/navigation logic here
  }

  changePassword(): void {
    console.log('Changing password...');
    this.showAdminDropdown = false;
    // Add change password modal/navigation logic here
  }

  viewSettings(): void {
    console.log('Opening settings...');
    this.showAdminDropdown = false;
    // Add settings modal/navigation logic here
  }

  logout(): void {
    console.log('Logging out...');

    // Add logout animation
    const headerElement = document.querySelector(
      '.professional-header'
    ) as HTMLElement;
    if (headerElement) {
      headerElement.style.animation = 'fadeOut 0.5s ease';
    }

    // Simulate logout process
    setTimeout(() => {
      // Call the actual logout method from AuthService
      // You can inject AuthService here if needed
      console.log('User logged out successfully');
      // For now, redirect to login
      window.location.href = '/';
    }, 500);

    this.showAdminDropdown = false;
  }
}
