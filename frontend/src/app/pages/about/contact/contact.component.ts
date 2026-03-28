import { Component } from '@angular/core';
import { ContactService } from '../../../services/contact.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {

  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  // Modal control
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  constructor(private contactService: ContactService) {}

  submitForm() {
    this.contactService.sendMessage(this.formData).subscribe({
    next: (res: any) => {
  this.modalTitle = 'Message Sent';
  this.modalMessage = 'Your message has been sent successfully.';
  this.showModal = true;

  // Auto close after 3 seconds
  setTimeout(() => {
    this.showModal = false;
  }, 3000);

  this.formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
},

      error: (err: any) => {
        console.error(err);
        this.modalTitle = 'Error';
        this.modalMessage = 'Something went wrong. Please try again.';
        this.showModal = true;
      }
    });
  }

  closeModal() {
    this.showModal = false;
  }
}
