// login.component.ts

import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from "../../services/user.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent  {
  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService) {}

  loginIn: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required, Validators.min(3)]),
  });

  hide = true;

  get emailInput() { return this.loginIn.get('emailInput'); }
  get passwordInput() { return this.loginIn.get('passwordInput'); }

  onSubmit() {
    if (this.loginIn.valid) {
      const { email, password } = this.loginIn.value;

      this.authService.login(email, password).subscribe((user) => {
        if (user) {
          this.userService.setAuthorizedUser(user); // Установка authorizedUser через UserService
          this.router.navigate(['/news']);
        }
      });
    }
  }
}
