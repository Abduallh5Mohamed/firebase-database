import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule,CommonModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  constructor(public router: Router){}

  isDashboardActive(): boolean {
    return (
      this.router.url.includes('/customer/') ||
      this.router.url.includes('/technician/') ||
      this.router.url.includes('/driver/')
    );
  }
}
