import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  // USER or ADMIN tab
  loginMode: 'USER' | 'ADMIN' = 'USER';

  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /* =========================
     SWITCH LOGIN MODE
  ========================= */
  setMode(mode: 'USER' | 'ADMIN'): void {

    this.loginMode = mode;

    // Clear error when switching tabs
    this.errorMessage = '';

  }

  /* =========================
     LOGIN
  ========================= */
  login(): void {

    if (!this.email || !this.password) {

      this.errorMessage = 'Email and password are required';

      return;

    }

    this.loading = true;
    this.errorMessage = '';

    const loginPayload = {

      email: this.email,
      password: this.password,
      role: this.loginMode   // 🔥 IMPORTANT

    };

    this.authService.login(loginPayload).subscribe({

      next: (res: any) => {

        const userRole = res.user?.role;

        // 🔐 Redirect based on role
        if (userRole === 'ADMIN') {

          this.router.navigate(['/admin']);

        } else {

          this.router.navigate(['/dashboard']);

        }

        this.loading = false;

      },

      error: (err) => {

        this.errorMessage =
          err.error?.message || 'Invalid email or password';

        this.loading = false;

      }

    });

  }

}
