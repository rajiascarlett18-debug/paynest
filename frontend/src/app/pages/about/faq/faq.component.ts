import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {

  faqs = [
    {
      question: 'How do I look up my bills?',
      answer: 'Enter your TRN in the Quick Bill Lookup section on the homepage.',
      open: false
    },
    {
      question: 'Is PayNest secure?',
      answer: 'Yes. We use bank-level encryption to protect your data.',
      open: false
    },
    {
      question: 'Can I view my payment history?',
      answer: 'Yes. After logging in, visit the Dashboard to view all past payments.',
      open: false
    }
  ];

  toggleFAQ(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

}
