import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss'],
})

export class UserRegistrationComponent {
  constructor(private httpClient: HttpClient, private router: Router) {}

  signIn: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    birthdate: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.email, Validators.required ]),
    password: new FormControl('', [Validators.required, Validators.min(3) ])
  });

  hide = true;
  isRegisteredOver = false;
  get nameInput() { return this.signIn.get('nameInput'); }
  get birthdateInput() { return this.signIn.get('birthdateInput'); }
  get emailInput() { return this.signIn.get('emailInput'); }
  get passwordInput() { return this.signIn.get('passwordInput'); }

  onSubmit() {
    if (this.signIn.valid) {
      const serverUrl = 'https://localhost:1338';
      const newUser = this.signIn.value;

      const originalDate = new Date(newUser.birthdate);
      const day = originalDate.getDate().toString().padStart(2, '0');
      const month = (originalDate.getMonth() + 1).toString().padStart(2, '0');
      const year = originalDate.getFullYear();
      newUser.birthdate = `${day}.${month}.${year}`;

      newUser.photoUrl = 'https://i.imgur.com/OJlZPI1.png'; // default vk img
      newUser.role = null;
      newUser.status = null;
      newUser.friends = null;

      this.httpClient.post(`${serverUrl}/api/users`, newUser).subscribe();
      this.isRegisteredOver = true;

      setTimeout(() => {
        this.isRegisteredOver = false;
        this.router.navigate(['/login'])
      }, 500)
    }
  }
}
