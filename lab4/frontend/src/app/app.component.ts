import {HttpClient} from "@angular/common/http";
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {BehaviorSubject, Observable, tap} from 'rxjs'; // Импортируйте Observable
import { IUser } from './interfaces/IUser';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private userService: UserService,
    private httpClient: HttpClient,
  ) {}

  authorizedUser$: Observable<IUser | undefined> = new Observable<IUser>()

  ngOnInit() {
    this.authorizedUser$ = this.userService.authorizedUser$;
    const user: string | null = localStorage.getItem('loginedUser');

    if (user) {
      // /user/:userName
      const parsedUser = JSON.parse(user) as IUser;
      const serverUrl = 'https://localhost:1338';

      this.httpClient.get(`${serverUrl}/api/user/${parsedUser.id}`).subscribe(user => {
        console.log(user as IUser)
        this.userService.setAuthorizedUser(user as IUser);
      })

      this.router.navigate(['/news']);
    }
  }

  logOut() {
    localStorage.clear();
    this.userService.setAuthorizedUser(undefined);
    this.router.navigate(['/login']);
  }
}
