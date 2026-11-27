import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { IUser } from "../../interfaces/IUser";
import { UserService } from "../../services/user.service";
import { MatDialog } from '@angular/material/dialog';
import { NewsDialogComponent } from "../news-dialog/news-dialog.component";

@Component({
  selector: 'app-add-news',
  templateUrl: './add-news.component.html',
  styleUrls: ['./add-news.component.scss']
})
export class AddNewsComponent implements OnInit {
  user: IUser | undefined;
  error = '';

  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.user = this.userService.getAuthorizedUser();
  }

  addNews: FormGroup = new FormGroup({
    text: new FormControl('', [Validators.required]),
  });

  get textInput() { return this.addNews.get('textInput'); }

  onSubmit() {
    if (this.addNews.valid) {
      const userId = this.user?.id;
      const serverUrl = 'https://localhost:1338';
      const news = this.addNews.value;


      if (this.user && news) {
        this.httpClient.post(`${serverUrl}/addNews/${userId}`, news, this.userService.authorization())
          .subscribe({
            next: () => {
              this.userService.updateAuthorizedUser();
              this.addNews.reset();
              this.openDialog('0ms', '0ms');
            },
            error: () => { this.error = 'Не удалось опубликовать новость'; },
          });
      }
    }
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(NewsDialogComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
      });
  }
}
