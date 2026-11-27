import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {Observable} from 'rxjs'; // Импортируйте Observable
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
  ) {}

  authorizedUser$: Observable<IUser | undefined> = new Observable<IUser>()

  ngOnInit() {
    this.authorizedUser$ = this.userService.authorizedUser$;
    localStorage.removeItem('loginedUser');
  }

  logOut() {
    this.userService.logOut();
    this.router.navigate(['/login']);
  }
}
