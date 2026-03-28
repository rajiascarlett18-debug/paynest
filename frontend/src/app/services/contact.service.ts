import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendMessage(data: any) {
    return this.http.post(this.API_URL + '/contact', data);
  }
}
