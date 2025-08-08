import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TechnicianEarningsComponent } from "../earnings/earnings.component";
import { JobsComponent } from "../jobs/jobs.component";
import { TechnicianProfileComponent } from "../profile/technician-profile.component";
import { UserDataService, UserProfile } from '../../../Services/user-data.service';
import { AuthService } from '../../../Services/auth.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-technicians-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TechnicianEarningsComponent, JobsComponent, TechnicianProfileComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class TechniciansDashboardComponent implements OnInit {
  profile: any = {
    name: 'Loading...',
    rating: 0,
    totalJobs: 0,
    earningsToday: 0,
    earningsWeek: 0,
    earningsMonth: 0
  };

  activeTab = 'Dashboard';
  availability = 'Available';

  jobsToday = [
    { title: 'Oil Change & Filter', status: 'Accepted', time: '10:00 AM', customer: 'Sarah Wilson', distance: '2.3 km', price: 65 },
    { title: 'Brake Inspection', status: 'Pending', time: '2:00 PM', customer: 'John Davis', distance: '4.1 km', price: 85 },
    { title: 'Tire Replacement', status: 'Accepted', time: '4:00 PM', customer: 'Emma Brown', distance: '3.2 km', price: 120 },
    { title: 'Engine Diagnostic', status: 'Pending', time: '6:30 PM', customer: 'Michael Lee', distance: '5.0 km', price: 150 }
  ];

  constructor(
    private userDataService: UserDataService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadUserProfile();
  }

  private async loadUserProfile() {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        const userProfile = await this.userDataService.getUserProfile(currentUser.uid);
        if (userProfile) {
          this.profile = {
            name: userProfile.displayName || 'Technician',
            rating: userProfile.rating || 0,
            totalJobs: userProfile.completedJobs || 0,
            earningsToday: 245, // These would come from a separate earnings service
            earningsWeek: 1680,
            earningsMonth: 6420
          };
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }


  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
