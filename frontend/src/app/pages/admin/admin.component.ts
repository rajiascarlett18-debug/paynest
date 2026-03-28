import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  users: any[] = [];
  bills: any[] = [];
  transactions: any[] = [];
  analytics: any = {};

  // 🔥 NOW GROUPED BY FULL NAME
  groupedBills: { [key: string]: any[] } = {};

  loading = true;

  newBill = {
    userId: '',
    name: '',
    amount: '',
    dueDate: ''
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  /* =========================
     LOAD ALL ADMIN DATA
  ========================= */
  loadData(): void {
    this.loading = true;

    this.adminService.getUsers().subscribe({
      next: (users: any) => {
        this.users = users || [];
      },
      error: (err) => console.error('Failed to load users', err)
    });

    this.adminService.getBills().subscribe({
      next: (bills: any) => {
        console.log('Bills response:', bills);
        this.bills = bills || [];
        this.groupBills();
      },
      error: (err) => console.error('Failed to load bills', err)
    });

    this.adminService.getTransactions().subscribe({
      next: (transactions: any) => {
        this.transactions = transactions || [];
      },
      error: (err) => console.error('Failed to load transactions', err)
    });

    this.adminService.getAnalytics().subscribe({
      next: (data: any) => {
        this.analytics = data || {};
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load analytics', err);
        this.loading = false;
      }
    });
  }

  /* =========================
     GROUP BILLS BY FULL NAME
  ========================= */
  groupBills(): void {
    this.groupedBills = {};

    if (!this.bills || !this.bills.length) return;

    this.bills.forEach(bill => {

      const key = bill.full_name;

      if (!key) {
        console.warn('Bill missing full_name:', bill);
        return;
      }

      if (!this.groupedBills[key]) {
        this.groupedBills[key] = [];
      }

      this.groupedBills[key].push(bill);
    });

    console.log('Grouped Bills:', this.groupedBills);
  }

  /* =========================
     CHECK IF DUE DATE IS URGENT
  ========================= */
  isUrgent(dueDate: string): boolean {
    if (!dueDate) return false;

    const today = new Date();
    const due = new Date(dueDate);

    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);

    const diffMs = due.getTime() - today.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays <= 7;
  }

  promote(userId: number): void {
    this.adminService.promoteUser(userId).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Promote failed', err)
    });
  }

  updateBill(bill: any): void {
    this.adminService.updateBill(bill.id, {
      amount: bill.amount,
      status: bill.status
    }).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Update failed', err)
    });
  }

  deleteBill(id: number): void {
    if (!confirm('Are you sure you want to delete this bill?')) return;

    this.adminService.deleteBill(id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Delete failed', err)
    });
  }

  createBill(): void {

    if (
      !this.newBill.userId ||
      !this.newBill.name ||
      !this.newBill.amount ||
      !this.newBill.dueDate
    ) {
      alert('All fields are required');
      return;
    }

    this.adminService.createBill(this.newBill).subscribe({
      next: () => {

        this.newBill = {
          userId: '',
          name: '',
          amount: '',
          dueDate: ''
        };

        this.loadData();
      },
      error: (err) => {
        console.error('Create bill failed', err);
      }
    });
  }

}
