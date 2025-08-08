import { Routes } from '@angular/router';

// Landing Page Components
import { HomeComponent } from '../Components/Landing/home/home.component';
import { AboutComponent } from '../Components/Landing/about/about.component';
import { FeedbackComponent } from '../Components/Landing/feedback/feedback.component';
import { ServicesComponent } from '../Components/Landing/services/services.component';
import { TechniciansComponent as LandingTechniciansComponent } from '../Components/Landing/technicians/technicians.component';

// Admin Components
import { DashboardComponent as AdminDashboardComponent } from '../Components/Admin/dashboard/dashboard.component';
import { DashboardHomeComponent } from '../Components/Admin/dashboard-home/dashboard-home.component';
import { CustomersComponent } from '../Components/Admin/customers/customers.component';
import { DriversComponent } from '../Components/Admin/drivers/drivers.component';
import { TechniciansComponent as AdminTechniciansComponent } from '../Components/Admin/technicians/technicians.component';
import { OrdersComponent } from '../Components/Admin/orders/orders.component';
import { StockComponent } from '../Components/Admin/stock/stock.component';
import { FinancialComponent } from '../Components/Admin/financial/financial.component';

// Customer Components
import { DashboardComponent as CustomerDashboardComponent } from '../Components/Customer/dashboard/dashboard.component';
import { VehiclesComponent } from '../Components/Customer/vehicles/vehicles.component';
import { ServiceHistoryComponent } from '../Components/Customer/service-history/service-history.component';
import { DriverDashboardComponent } from '../Components/Driver/driver-dashboard/driver-dashboard.component';

// Technician Dashboard Components
import { TechniciansDashboardComponent } from '../Components/TechniciansDashboard/dashboard/dashboard.component';
import { JobsComponent } from '../Components/TechniciansDashboard/jobs/jobs.component';
import { SignUpComponent } from '../Components/Auth/sign-up/sign-up.component';
import { LoginComponent as AuthLoginComponent } from '../Components/Auth/login/login.component';
import { PendingVerificationComponent } from '../Components/Auth/pending-verification/pending-verification.component';
import { AuthGuard } from '../Guards/auth.guard';
import { TechnicianEarningsComponent } from '../Components/TechniciansDashboard/earnings/earnings.component';
import { TechnicianProfileComponent } from '../Components/TechniciansDashboard/profile/technician-profile.component';
import { DriverJobsComponent } from '../Components/Driver/driver-jobs/driver-jobs.component';
import { DriverEarningsComponent } from '../Components/Driver/driver-earnings/driver-earnings.component';
import { DriverProfileComponent } from '../Components/Driver/driver-profile/driver-profile.component';
import { DriverSharedComponent } from '../Components/Driver/driver-shared/driver-shared.component';

export const routes: Routes = [
  // Landing Page Routes
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: FeedbackComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'technicians', component: LandingTechniciansComponent },

  // Authentication routes
  {
    path: 'auth',
    children: [
      { path: 'login', component: AuthLoginComponent },
      { path: 'sign-up', component: SignUpComponent },
      { path: 'pending-verification', component: PendingVerificationComponent },
    ],
  },

  // Legacy routes for backward compatibility
  { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'signUp', redirectTo: '/auth/sign-up', pathMatch: 'full' },

  // Customer Dashboard with Child Routes
  {
    path: 'customer',
    component: CustomerDashboardComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CustomerDashboardComponent },
      { path: 'vehicles', component: VehiclesComponent },
      { path: 'service-history', component: ServiceHistoryComponent },
    ],
  },

  // Technician Dashboard with Child Routes
  {
    path: 'technician',
    component: TechniciansDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TechniciansDashboardComponent },
      { path: 'jobs', component: JobsComponent },
      { path: 'earnings', component: TechnicianEarningsComponent },
      { path: 'profile', component: TechnicianProfileComponent },
    ],
  },

  // Admin Dashboard with Child Routes
  {
    path: 'admin',
    component: AdminDashboardComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardHomeComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'drivers', component: DriversComponent },
      { path: 'technicians', component: AdminTechniciansComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'stock', component: StockComponent },
      { path: 'financial', component: FinancialComponent },
    ],
  },

  // Legacy Routes (redirects for backward compatibility)
  { path: 'dashboard', redirectTo: '/customer/dashboard', pathMatch: 'full' },
  { path: 'vehicles', redirectTo: '/customer/vehicles', pathMatch: 'full' },
  {
    path: 'service-history',
    redirectTo: '/customer/service-history',
    pathMatch: 'full',
  },
  { path: 'jobs', redirectTo: '/technician/jobs', pathMatch: 'full' },
  {
    path: 'technicianearnings',
    redirectTo: '/technician/earnings',
    pathMatch: 'full',
  },
  {
    path: 'driver',
    component: DriverSharedComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DriverDashboardComponent },
      { path: 'job', component: DriverJobsComponent },
      { path: 'earnings', component: DriverEarningsComponent },
      { path: 'profile', component: DriverProfileComponent },
    ],
  },
  { path: '**', redirectTo: '/home' },
];
