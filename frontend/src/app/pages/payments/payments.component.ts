import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { BillService } from '../../services/bill.service';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit, OnDestroy {

  cart: any[] = [];
  loading = false;

  paymentForm!: FormGroup;

  cardType: string | null = null;

  paymentStatus: 'idle' | 'success' | 'error' = 'idle';
  errorMessage: string = '';

  countdown: number = 3;
  private countdownSubscription!: Subscription;
  private billsSubscription!: Subscription;

  constructor(
    private billService: BillService,
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.paymentForm = this.fb.group({
      cardName: ['', Validators.required],
      cardNumber: ['', Validators.required],
      expiry: ['', Validators.required],
      cvv: ['', Validators.required]
    });

    // Card detection
    this.paymentForm.get('cardNumber')?.valueChanges.subscribe(value => {

      if (!value) {
        this.cardType = null;
        return;
      }

      const cleaned = value.replace(/\s/g, '');

      if (/^4/.test(cleaned)) this.cardType = 'visa';
      else if (/^5[1-5]/.test(cleaned)) this.cardType = 'mastercard';
      else if (/^3[47]/.test(cleaned)) this.cardType = 'amex';
      else if (/^6/.test(cleaned)) this.cardType = 'discover';
      else this.cardType = null;

      const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();

      if (formatted !== value) {
        this.paymentForm.get('cardNumber')?.setValue(formatted, {
          emitEvent: false
        });
      }
    });

    this.billService.loadBills();

    this.billsSubscription = this.billService.bills$.subscribe(bills => {
      this.cart = bills.filter(b => b.status === 'UNPAID');
    });
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
  }

  getFormattedTotal(): string {
    const total = this.cart.reduce(
      (sum, bill) => sum + Number(bill.amount),
      0
    );
    return total.toFixed(2);
  }

  async processPayment(): Promise<void> {

    if (this.paymentForm.invalid || this.cart.length === 0 || this.paymentStatus === 'success') return;

    this.loading = true;
    this.paymentStatus = 'idle';
    this.errorMessage = '';

    try {

      for (const bill of this.cart) {
        await this.paymentService
          .payBill(bill.id)
          .toPromise();
      }

      const paidIds = this.cart.map(b => b.id);
      this.billService.removeBills(paidIds);

      this.paymentStatus = 'success';
      this.startCountdown();

    } catch (error: any) {

      this.paymentStatus = 'error';
      this.errorMessage =
        error?.error?.message || 'Payment failed. Please try again.';
    }

    this.loading = false;
  }

  private startCountdown(): void {
    this.countdown = 3;

    this.countdownSubscription = interval(1000).subscribe(() => {
      this.countdown--;

      if (this.countdown === 0) {
        this.countdownSubscription.unsubscribe();
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.billsSubscription) this.billsSubscription.unsubscribe();
    if (this.countdownSubscription) this.countdownSubscription.unsubscribe();
  }
}
