import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

export interface User {
  id: number;
  fullName: string;
  email: string;
  trn?: string;
  role: 'USER' | 'ADMIN';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = 'http://localhost:3000/api';

  // Reactive user state across the entire app
  private userSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /* =========================
     REGISTER
  ========================= */
  register(data: {
    fullName: string;
    email: string;
    password: string;
    trn: string;
  }) {
    return this.http.post(`${this.API_URL}/auth/register`, data);
  }

  /* =========================
     LOGIN
     Supports USER / ADMIN tabs
  ========================= */
  login(data: {
    email: string;
    password: string;
    role: 'USER' | 'ADMIN';
  }) {

    return this.http.post<{ token: string; user: User }>(
      `${this.API_URL}/auth/login`,
      data
    ).pipe(

      tap(res => {

        // Save JWT
        localStorage.setItem('token', res.token);

        // Save user
        localStorage.setItem('user', JSON.stringify(res.user));

        // Update reactive state
        this.userSubject.next(res.user);

      })

    );

  }

  /* =========================
     LOGOUT
  ========================= */
  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear global user state
    this.userSubject.next(null);

    // Redirect to login
    this.router.navigate(['/login']);

  }

  /* =========================
     PRIVATE HELPER
  ========================= */
  private getStoredUser(): User | null {

    const user = localStorage.getItem('user');

    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }

  }

  /* =========================
     PUBLIC HELPERS
  ========================= */

  getUser(): User | null {
    return this.getStoredUser();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {

    const user = this.getStoredUser();

    return user?.role === 'ADMIN';

  }

  isUser(): boolean {

    const user = this.getStoredUser();

    return user?.role === 'USER';

  }

}
