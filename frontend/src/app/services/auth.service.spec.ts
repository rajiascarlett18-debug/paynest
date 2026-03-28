import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from '../pages/register/register.component';
import { AuthService } from './auth.service';


describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit form when valid', () => {
    authServiceSpy.register.and.returnValue(of({}));

    component.registerForm.setValue({
      fullName: 'John Brown',
      email: 'john@test.com',
      trn: '123456789',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onRegister();

    expect(authServiceSpy.register).toHaveBeenCalled();
  });

  it('should handle registration error', () => {
    authServiceSpy.register.and.returnValue(
      throwError(() => ({ error: { message: 'User exists' } }))
    );

    component.registerForm.setValue({
      fullName: 'John Brown',
      email: 'john@test.com',
      trn: '123456789',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onRegister();

    expect(component.errorMessage).toBe('User exists');
  });
});
