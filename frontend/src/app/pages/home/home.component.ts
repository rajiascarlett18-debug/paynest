import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BillService } from '../../services/bill.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  isLoggedIn = false;

  totalAmount = 0;
  nextBill: any | null = null;

  trnForm!: FormGroup;

  lookupCount: number | null = null;
  userExists: boolean | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private billService: BillService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {

    this.isLoggedIn = this.authService.isLoggedIn();

    this.trnForm = this.fb.group({
      trn: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{9}$/) // 🔥 exact 9 digit TRN
        ]
      ]
    });

    if (this.isLoggedIn) {

      this.billService.loadBills();

      this.billService.bills$.subscribe(bills => {

        const unpaid = bills.filter(b => b.status === 'UNPAID');

        this.totalAmount = unpaid.reduce(
          (sum, bill) => sum + Number(bill.amount),
          0
        );

        this.nextBill = unpaid.length > 0
          ? [...unpaid].sort(
              (a, b) =>
                new Date(a.dueDate).getTime() -
                new Date(b.dueDate).getTime()
            )[0]
          : null;
      });
    }
  }

  onSubmit(): void {

    if (this.trnForm.invalid) return;

    this.loading = true;
    this.lookupCount = null;
    this.userExists = null;

    const trn = this.trnForm.value.trn;

    this.billService.lookupByTrn(trn).subscribe({
      next: (res: any) => {

        this.userExists = res.exists;

        if (res.exists) {
          this.lookupCount = res.count;
        } else {
          this.lookupCount = null;
        }

        this.loading = false;
      },
      error: () => {
        this.userExists = false;
        this.lookupCount = null;
        this.loading = false;
      }
    });
  }
}
