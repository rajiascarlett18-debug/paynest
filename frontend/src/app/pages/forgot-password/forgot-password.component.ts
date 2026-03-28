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
    if (!this.email) return;

    this.loading = true;
    this.message = '';
    this.error = '';

    this.http.post<any>(`${this.API_URL}/forgot-password`, {
      email: this.email
    }).subscribe({
      next: (res) => {
        this.loading = false;

        // Always same message (security best practice)
        this.message = res.message;

        // Clear input after submit
        this.email = '';
      },
      error: () => {
        this.loading = false;
        this.error = 'Something went wrong. Please try again.';
      }
    });
  }
}
