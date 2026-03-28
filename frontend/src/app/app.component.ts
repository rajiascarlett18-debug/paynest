import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  chatOpen = false;
  userMessage = '';
  loading = false;

  messages: { text: string; sender: string }[] = [
    { text: 'Hi! How can I assist you today?', sender: 'bot' }
  ];

  constructor(private http: HttpClient) {}

  toggleChat() {
    this.chatOpen = !this.chatOpen;
  }

sendMessage() {
  if (!this.userMessage.trim()) return;

  const userText = this.userMessage;
  this.messages.push({ text: userText, sender: 'user' });
  this.userMessage = '';

  this.messages.push({ text: 'Typing...', sender: 'bot' });

  this.http.post<any>(`${environment.apiUrl}/chat`, {
    message: userText
  }).subscribe({
    next: (res) => {
      this.messages.pop(); // remove typing
      this.messages.push({ text: res.reply, sender: 'bot' });
    },
    error: () => {
      this.messages.pop();
      this.messages.push({
        text: "Sorry, I'm having trouble right now.",
        sender: 'bot'
      });
    }
  });
}
}
