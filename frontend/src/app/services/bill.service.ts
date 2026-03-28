import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillService {

  private API_URL = environment.apiUrl;

  /* =========================
     CENTRAL BILL STORE
  ========================= */
  private billsSubject = new BehaviorSubject<any[]>([]);
  public bills$ = this.billsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /* =========================
     LOAD BILLS FOR LOGGED-IN USER
  ========================= */
  loadBills(): void {
    const user = this.authService.getUser();

    if (!user?.id) return;

    this.getBillsByUser(user.id).subscribe({
      next: (bills) => this.billsSubject.next(bills),
      error: (err) => console.error('Failed to load bills:', err)
    });
  }

  /* =========================
     GET BILLS BY USER ID
  ========================= */
  getBillsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API_URL}/bills/user/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /* =========================
     GET PAID BILLS (HISTORY)
  ========================= */
  getPaidBills(): Observable<any[]> {
    const user = this.authService.getUser();

    if (!user?.id) return of([]);

    return this.http.get<any[]>(
      `${this.API_URL}/bills/paid/${user.id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /* =========================
     PUBLIC TRN SEARCH
  ========================= */
  searchOutstandingByTrn(trn: string): Observable<number> {
    return this.http.get<any>(
      `${this.API_URL}/bills/lookup/${trn}`
    ).pipe(
      map(res => res.count)
    );
  }

  lookupByTrn(trn: string) {
    return this.http.get(
      `${this.API_URL}/bills/lookup/${trn}`
    );
  }

  /* =========================
     REMOVE PAID BILLS LOCALLY
     (After Stripe payment)
  ========================= */
  removeBills(paidIds: number[]): void {
    const updated = this.billsSubject.value.filter(
      bill => !paidIds.includes(bill.id)
    );
    this.billsSubject.next(updated);
  }

  /* =========================
     TOTAL UNPAID AMOUNT
  ========================= */
  getTotalAmount(): Observable<number> {
    return this.bills$.pipe(
      map(bills =>
        bills
          .filter(bill => bill.status === 'UNPAID')
          .reduce((total, bill) => total + Number(bill.amount), 0)
      )
    );
  }

  /* =========================
     NEXT DUE UNPAID BILL
  ========================= */
  getNextDueBill(): Observable<any | null> {
    return this.bills$.pipe(
      map(bills => {
        const unpaid = bills.filter(b => b.status === 'UNPAID');

        if (unpaid.length === 0) return null;

        return [...unpaid].sort(
          (a, b) =>
            new Date(a.dueDate).getTime() -
            new Date(b.dueDate).getTime()
        )[0];
      })
    );
  }

  /* =========================
     PRIVATE: AUTH HEADERS
  ========================= */
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

}
