// login.component.ts

import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent  {
  constructor(
    private authService: AuthService,
    private router: Router) {}

  loginIn: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required, Validators.min(3)]),
  });

  hide = true;
  error = '';

  get emailInput() { return this.loginIn.get('emailInput'); }
  get passwordInput() { return this.loginIn.get('passwordInput'); }

  onSubmit() {
    if (this.loginIn.valid) {
      const { email, password } = this.loginIn.value;

      this.error = '';
      this.authService.login(email, password).subscribe({
        next: () => this.router.navigate(['/news']),
        error: () => { this.error = 'Не удалось войти. Проверьте почту и пароль.'; },
      });
    }
  }
}
