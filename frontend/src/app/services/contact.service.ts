import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  sendMessage(data: any) {
    return this.http.post(this.API_URL + '/contact', data);
  }
}
