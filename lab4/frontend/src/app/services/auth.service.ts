// auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { IUser } from '../interfaces/IUser';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private httpClient: HttpClient, private userService: UserService) {}

  login(email: string, password: string): Observable<IUser> {
    return this.httpClient.post<{ user: IUser; token: string }>(
      `${this.userService.serverUrl}/api/login`, { email, password }
    ).pipe(
      tap(({ user, token }) => this.userService.setSession(user, token)),
      map(({ user }) => user)
    );
  }
}
