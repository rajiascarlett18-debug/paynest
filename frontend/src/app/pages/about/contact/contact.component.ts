import { Component } from '@angular/core';
import { ContactService } from '../../../services/contact.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {

  /* =========================
     FORM DATA
  ========================== */
  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  /* =========================
     UI STATES
  ========================== */
  loading = false;

  // Modal
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  constructor(private contactService: ContactService) {}

  /* =========================
     SUBMIT FORM
  ========================== */
  submitForm() {

    // 🔥 Basic validation
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      this.showModalMessage('Missing Fields', 'Please fill all required fields.');
      return;
    }

    this.loading = true;

    this.contactService.sendMessage(this.formData).subscribe({

      /* =========================
         SUCCESS
      ========================== */
      next: (res: any) => {
        console.log('✅ Contact success:', res);

        this.loading = false;

        this.showModalMessage(
          'Message Sent',
          res?.message || 'Your message has been sent successfully.'
        );

        // 🔹 Reset form
        this.formData = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };
      },

      /* =========================
         ERROR
      ========================== */
      error: (err: any) => {
        console.error('❌ Contact error:', err);

        this.loading = false;

        const backendMessage =
          err?.error?.message ||
          'Something went wrong. Please try again.';

        this.showModalMessage('Error', backendMessage);
      }
    });
  }

  /* =========================
     MODAL HELPER
  ========================== */
  showModalMessage(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;

    // Auto close after 3 seconds
    setTimeout(() => {
      this.showModal = false;
    }, 3000);
  }

  /* =========================
     CLOSE MODAL (MANUAL)
  ========================== */
  closeModal() {
    this.showModal = false;
  }
}
