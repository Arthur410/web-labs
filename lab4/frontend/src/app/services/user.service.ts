// user.service.ts

import {HttpClient} from "@angular/common/http";
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser } from '../interfaces/IUser';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private httpClient:HttpClient) {
  }
  serverUrl = 'https://localhost:1338'

  private authorizedUserSubject = new BehaviorSubject<IUser | undefined>(undefined);
  authorizedUser$: Observable<IUser | undefined> = this.authorizedUserSubject.asObservable();

  setAuthorizedUser(user: IUser | undefined) {
    this.authorizedUserSubject.next(user);
    localStorage.setItem('loginedUser', JSON.stringify(user));
  }

  getAllUsers() {
    return this.httpClient.get(`${this.serverUrl}/api/allNames`)
  }

  updateAuthorizedUser() {
    this.httpClient.get(`${this.serverUrl}/api/user/${this.authorizedUserSubject.value?.id}`).subscribe(user => {
      this.setAuthorizedUser(user as IUser)
    })
  }

  deleteFriend(friend: string) {
    this.httpClient.delete(`${this.serverUrl}/api/removeFriend/${this.authorizedUserSubject.value?.id}/${friend}`).subscribe(val => {
      this.updateAuthorizedUser()
    })
  }

  addFriend(friend: string) {
    const userId = this.authorizedUserSubject.value?.id;
    this.httpClient.post(`${this.serverUrl}/api/addFriend/${userId}`, {friend}).subscribe(val => {
      this.updateAuthorizedUser()
    })
  }

  getAuthorizedUser(): IUser | undefined {
    return this.authorizedUserSubject.value;
  }
}
