import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm!: FormGroup;
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        trn: [
          '',
          [
            Validators.required,
            Validators.pattern('^[0-9]{9}$')
          ]
        ],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  /* =========================
     PASSWORD MATCH VALIDATOR
  ========================= */
  passwordMatchValidator(form: AbstractControl): { [key: string]: any } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password !== confirmPassword ? { mismatch: true } : null;
  }

  /* =========================
     REGISTER SUBMIT
  ========================= */
  onRegister(): void {

  this.errorMessage = '';

  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }

  const payload = {
    fullName: this.registerForm.value.fullName,
    email: this.registerForm.value.email,
    password: this.registerForm.value.password,
    trn: this.registerForm.value.trn
  };

  this.authService.register(payload).subscribe({
    next: () => {
      alert('✅ Account created successfully!');
      this.router.navigate(['/login']);
    },
   error: err => {

  this.loading = false;

  if (err.status === 409) {

    if (err.error.message === 'TRN already registered') {
      this.registerForm.get('trn')?.setErrors({ trnExists: true });
    }

    if (err.error.message === 'Email already registered') {
      this.registerForm.get('email')?.setErrors({ emailExists: true });
    }

  } else {
    this.errorMessage = err.error?.message || 'Registration failed.';
  }

}

  });
}
}
