import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private API = environment.apiUrl + '/admin';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private headers() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.getToken()}`
      })
    };
  }

  getUsers() {
    return this.http.get(`${this.API}/users`, this.headers());
  }

  promoteUser(id: number) {
    return this.http.put(`${this.API}/promote/${id}`, {}, this.headers());
  }

  getBills() {
    return this.http.get(`${this.API}/bills`, this.headers());
  }

  updateBill(id: number, data: any) {
    return this.http.put(`${this.API}/bills/${id}`, data, this.headers());
  }

  deleteBill(id: number) {
    return this.http.delete(`${this.API}/bills/${id}`, this.headers());
  }
}
