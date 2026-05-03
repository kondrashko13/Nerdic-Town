import {Component, inject} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {AuthService} from '../services/auth/auth.service';
import {Router} from '@angular/router';

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) return null;

  return password === confirmPassword
    ? null
    : {passwordsMismatch: true};
};

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  isLoginMode = true;
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        confirmPassword: ['']
      },
      {
        validator: passwordsMatchValidator,
      });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.form.reset();
  }

  onSubmit() {
    if (this.form.invalid) return;

    const data = this.form.value;
    const request$ = this.isLoginMode
      ? this.authService.login(data)
      : this.authService.register(data);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoginMode = false;
      }
    });
  }
}
