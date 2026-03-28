import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { PaymentsComponent } from './payments.component';
import { BillService } from '../../services/bill.service';
import { PaymentService } from 'src/app/core/services/payment.service';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;

  // 🔥 Mock Bills
  const mockBills = [
    {
      id: 1,
      name: 'JPS Electricity',
      amount: 150,
      dueDate: new Date(),
      status: 'UNPAID'
    },
    {
      id: 2,
      name: 'Water Commission',
      amount: 75,
      dueDate: new Date(),
      status: 'UNPAID'
    }
  ];

  // 🔥 Mock BillService
  const billServiceMock = {
    loadBills: jasmine.createSpy('loadBills'),
    bills$: of(mockBills)
  };

  // 🔥 Mock PaymentService
  const paymentServiceMock = {
    payBill: jasmine.createSpy('payBill').and.returnValue(of({}))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentsComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: BillService, useValue: billServiceMock },
        { provide: PaymentService, useValue: paymentServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the payments component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize payment form with required controls', () => {
    expect(component.paymentForm).toBeTruthy();
    expect(component.paymentForm.contains('cardName')).toBeTrue();
    expect(component.paymentForm.contains('cardNumber')).toBeTrue();
    expect(component.paymentForm.contains('expiry')).toBeTrue();
    expect(component.paymentForm.contains('cvv')).toBeTrue();
  });

  it('should mark form invalid when empty', () => {
    component.paymentForm.reset();
    expect(component.paymentForm.invalid).toBeTrue();
  });

  it('should accept valid card details', () => {
    component.paymentForm.setValue({
      cardName: 'John Brown',
      cardNumber: '1234567812345678',
      expiry: '0127',
      cvv: '123'
    });

    expect(component.paymentForm.valid).toBeTrue();
  });

  it('should initialize cart with bills', () => {
    expect(component.cart.length).toBe(2);
  });

  it('should remove a bill from the cart', () => {
    const initialLength = component.cart.length;
    component.removeFromCart(0);
    expect(component.cart.length).toBe(initialLength - 1);
  });

  it('should calculate total amount correctly', () => {
    const total = component.getFormattedTotal();
    expect(Number(total)).toBe(225);
  });
});
