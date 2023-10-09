import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FriendNewsService {
  private apiUrl = 'https://localhost:1338/friendsNews';

  constructor(private http: HttpClient) {}

  getFriendNews(userName: string) {
    return this.http.get(`${this.apiUrl}/${userName}`);
  }
}
