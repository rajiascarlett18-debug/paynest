import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  email: string = '';
  message: string = '';
  error: string = '';
  loading: boolean = false;

  private API_URL = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  submit(): void {

    /* =========================
       VALIDATION
    ========================== */
    if (!this.email) {
      this.error = 'Please enter your email address';
      return;
    }

    this.loading = true;
    this.message = '';
    this.error = '';

    console.log('📩 Sending forgot password request:', this.email);

    this.http.post<any>(`${this.API_URL}/forgot-password`, {
      email: this.email
    }).subscribe({

      /* =========================
         SUCCESS
      ========================== */
      next: (res) => {
        console.log('✅ Response:', res);

        this.loading = false;

        // 🔥 fallback message (in case backend doesn't return one)
        this.message =
          res?.message ||
          'If an account exists, a reset link has been sent.';

        this.email = '';
      },

      /* =========================
         ERROR
      ========================== */
      error: (err) => {
        console.error('❌ Forgot password error:', err);

        this.loading = false;

        // 🔥 show backend error if exists
        this.error =
          err?.error?.message ||
          'Server error. Please try again later.';
      }
    });
  }
}
