import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {IUser} from "../../interfaces/IUser";
import {UserService} from "../../services/user.service";
import { FriendNewsService } from '../../services/friend-news.service';
import { HttpClient } from '@angular/common/http';

interface INews {
  name: string,
  news: string[]
}

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})

export class NewsComponent implements OnInit {
  constructor(
    private userService: UserService,
    private friendNewsService: FriendNewsService) {}
  news: INews[] = [];

  authorizedUser$: Observable<IUser | undefined> = new Observable<IUser>()

  ngOnInit() {
    this.authorizedUser$ = this.userService.authorizedUser$;

    this.authorizedUser$.subscribe((user) => {

      if (user) {
        this.news.push(<INews>{
          name: 'Мои новости',
          news: user.news
        })

        user.friends?.forEach(friend => {
          this.friendNewsService.getFriendNews(friend).subscribe(val => {
            this.news.push(<INews>{
              name: friend,
              news: val
            })
          })
        })
      }

    })

  }
  protected readonly JSON = JSON;
}
