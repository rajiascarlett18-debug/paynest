import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { BillService } from '../../services/bill.service';

interface User {
  id: number;
  fullName: string;
  email: string;
  trn?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  user: User | null = null;

  upcomingBills: any[] = [];
  recentPayments: any[] = [];

  showHistoryDropdown = false;
  loading = true;

  private billsSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private billService: BillService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // 🔐 Redirect if not logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.authService.getUser();
    this.loading = true;

    // 🔄 Always reload bills from backend
    this.billService.loadBills();

    // 🔥 Subscribe to shared bill store
    this.billsSubscription = this.billService.bills$.subscribe(bills => {

      // Only UNPAID bills go to dashboard
      this.upcomingBills = bills.filter(
        bill => bill.status === 'UNPAID'
      );

      this.loading = false;
    });
  }

  /* =========================
     HISTORY DROPDOWN
  ========================= */

  toggleHistoryDropdown(): void {
    this.showHistoryDropdown = !this.showHistoryDropdown;

    if (this.showHistoryDropdown) {
      this.loadRecentPayments();
    }
  }

  loadRecentPayments(): void {
    this.billService.getPaidBills().subscribe({
      next: (data: any[]) => {
        this.recentPayments = data.slice(0, 3);
      },
      error: err => {
        console.error('Failed to load recent payments', err);
      }
    });
  }

  /* =========================
     LOGOUT
  ========================= */

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /* =========================
     CLEANUP
  ========================= */

  ngOnDestroy(): void {
    if (this.billsSubscription) {
      this.billsSubscription.unsubscribe();
    }
  }

}
