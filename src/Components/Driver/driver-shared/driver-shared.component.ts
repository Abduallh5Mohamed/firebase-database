import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AvailabilityStatusService } from '../../../Services/Driver/availability-status.service';
import { UserDataService, UserProfile } from '../../../Services/user-data.service';
import { AuthService } from '../../../Services/auth.service';


@Component({
  selector: 'app-driver-shared',
  standalone: true,
  templateUrl: './driver-shared.component.html',
  styleUrls: ['./driver-shared.component.css'],
  imports: [RouterModule, CommonModule]
})

export class DriverSharedComponent implements OnInit{
  activeTab: string = 'dashboard';
  availabilityStatus: string = 'Available';
  driverProfile: any = {
    name: 'Loading...',
    rating: 0,
    totalJobs: 0,
    earningsToday: 0,
    earningsWeek: 0
  };

  constructor(
    private router: Router, 
    private availabilityService: AvailabilityStatusService,
    private userDataService: UserDataService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.availabilityService.availabilityStatus$.subscribe(status => {
      this.availabilityStatus = status;
    });
    
    await this.loadDriverProfile();
  }

  private async loadDriverProfile() {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        const userProfile = await this.userDataService.getUserProfile(currentUser.uid);
        if (userProfile) {
          this.driverProfile = {
            name: userProfile.displayName || 'Driver',
            rating: userProfile.rating || 0,
            totalJobs: userProfile.totalTrips || 0,
            earningsToday: 245, // These would come from earnings service
            earningsWeek: 1680
          };
        }
      }
    } catch (error) {
      console.error('Error loading driver profile:', error);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    switch (tab) {
      case 'dashboard':
        this.router.navigate(['/driver/dashboard']);
        break;
      case 'jobs':
        this.router.navigate(['/driver/job']);
        break;
      case 'earnings':
        this.router.navigate(['/driver/earnings']);
        break;
      case 'profile':
        this.router.navigate(['/driver/profile']);
        break;
    }
  }
}
