// user.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUser } from '../interfaces/IUser';

@Injectable({ providedIn: 'root' })
export class UserService {
  readonly serverUrl = 'https://localhost:1338';
  private token?: string;
  private readonly authorizedUserSubject = new BehaviorSubject<IUser | undefined>(undefined);
  readonly authorizedUser$ = this.authorizedUserSubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  authorization() {
    return this.token ? { headers: { Authorization: `Bearer ${this.token}` } } : {};
  }

  setSession(user: IUser, token: string) {
    this.token = token;
    this.setAuthorizedUser(user);
  }

  setAuthorizedUser(user: IUser | undefined) {
    this.authorizedUserSubject.next(user);
  }

  logOut() {
    this.httpClient.post(`${this.serverUrl}/api/logout`, null, this.authorization())
      .subscribe({ error: () => {} });
    this.token = undefined;
    this.setAuthorizedUser(undefined);
  }

  getAllUsers() {
    return this.httpClient.get<string[]>(`${this.serverUrl}/api/allNames`);
  }

  updateAuthorizedUser() {
    const user = this.getAuthorizedUser();
    if (!user) return;
    this.httpClient.get<IUser>(`${this.serverUrl}/api/user/${user.id}`).subscribe({
      next: updated => {
        if (this.getAuthorizedUser()?.id === user.id) this.setAuthorizedUser(updated);
      },
      error: () => {},
    });
  }

  deleteFriend(friend: string) {
    const user = this.getAuthorizedUser();
    if (!user) return;
    this.httpClient.delete(`${this.serverUrl}/api/removeFriend/${user.id}/${encodeURIComponent(friend)}`,
      this.authorization()).subscribe({ next: () => this.updateAuthorizedUser(), error: () => {} });
  }

  addFriend(friend: string) {
    const user = this.getAuthorizedUser();
    if (!user) return;
    this.httpClient.post(`${this.serverUrl}/api/addFriend/${user.id}`, { friend },
      this.authorization()).subscribe({ next: () => this.updateAuthorizedUser(), error: () => {} });
  }

  getAuthorizedUser(): IUser | undefined {
    return this.authorizedUserSubject.value;
  }
}
