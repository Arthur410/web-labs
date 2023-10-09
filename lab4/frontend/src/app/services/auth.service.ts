// auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient: HttpClient, private userService: UserService) {}

  login(email: string, password: string): Observable<any> {
    const serverUrl = 'https://localhost:1338'; // Используйте правильный URL вашего сервера

    const loginData = { email, password };

    return this.httpClient.post(`${serverUrl}/api/login`, loginData).pipe(
      tap((response: any) => {
        if (response) {
          const authenticatedUser = response;

          this.userService.setAuthorizedUser(authenticatedUser);

          return authenticatedUser;
        } else {
          throw new Error('Ошибка аутентификации');
        }
      })
    );
  }
}
