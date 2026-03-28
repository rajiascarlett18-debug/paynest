import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // 🔧 Create mock AuthService
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the register component', () => {
    expect(component).toBeTruthy();
  });

  it('should mark form invalid when empty', () => {
    component.registerForm.reset();
    expect(component.registerForm.invalid).toBeTrue();
  });

  it('should validate password match', () => {
    component.registerForm.setValue({
      fullName: 'John Brown',
      email: 'john@test.com',
      trn: '123456789',
      password: 'password123',
      confirmPassword: 'password123'
    });

    expect(component.registerForm.valid).toBeTrue();
  });

  it('should call authService.register on valid form submit', () => {
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

  it('should handle backend error gracefully', () => {
    authServiceSpy.register.and.returnValue(
      throwError(() => ({ error: { message: 'User already exists' } }))
    );

    component.registerForm.setValue({
      fullName: 'John Brown',
      email: 'john@test.com',
      trn: '123456789',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onRegister();

    expect(component.errorMessage).toBe('User already exists');
  });
});
