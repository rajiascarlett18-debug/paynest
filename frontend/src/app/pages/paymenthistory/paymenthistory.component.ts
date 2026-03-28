import { Component, OnInit } from '@angular/core';
import { BillService } from '../../services/bill.service';

@Component({
  selector: 'app-paymenthistory',
  templateUrl: './paymenthistory.component.html',
  styleUrls: ['./paymenthistory.component.css']
})
export class PaymenthistoryComponent implements OnInit {

  payments: any[] = [];
  loading: boolean = true;

  constructor(private billService: BillService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.billService.getPaidBills().subscribe({
      next: (data: any) => {
        this.payments = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading payment history:', err);
        this.loading = false;
      }
    });
  }
}
