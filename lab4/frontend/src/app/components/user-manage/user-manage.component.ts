import {HttpClient} from "@angular/common/http";
import {Component, DestroyRef, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {Observable} from "rxjs";
import {IUser} from "../../interfaces/IUser";
import {UserService} from "../../services/user.service";

class ImageSnippet {
  constructor(public src: string, public file: File) {}
}

@Component({
  selector: 'app-user-manage',
  templateUrl: './user-manage.component.html',
  styleUrls: ['./user-manage.component.scss']
})

export class UserManageComponent implements OnInit {
  authorizedUser$: Observable<IUser | undefined> = new Observable<IUser>()
  user: IUser | undefined;
  allUsers: string[] | undefined;

  constructor(
    private router: Router,
    private userService: UserService,
    private httpClient: HttpClient,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    this.authorizedUser$ = this.userService.authorizedUser$;

    this.authorizedUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      this.user = user;

      this.userService.getAllUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(users => {
        this.allUsers = users as string[];

        this.allUsers = this.allUsers.filter(user => {
          return user !== this.user?.name && !this.user?.friends?.includes(user);
        });
      })
    })
  }

  onFriendDeleteButton(friend: string) {
    this.userService.deleteFriend(friend)
  }

  onFriendAddButton(friend:string) {
    this.userService.addFriend(friend)
  }

  onAvatarDeleteButton() {
    if (!this.user) return;

    const serverUrl = 'https://localhost:1338';

    this.httpClient.delete(`${serverUrl}/api/user/${this.user.id}/delete-avatar`, this.userService.authorization())
      .subscribe({ next: () => this.userService.updateAuthorizedUser(), error: () => {} });
  }

  selectedFile: string;
  loading = false;
  onAvatarChangeButton(imageInput: any) {
    const file: File = imageInput.files[0];
    if (!file || !this.user || file.size > 700_000) return;
    const reader = new FileReader();
    const serverUrl = 'https://localhost:1338';

    reader.addEventListener('load', (event: any) => {
      this.loading = true;
      this.httpClient.post(`${serverUrl}/api/image-upload/${this.user?.id}`, {image: event.target.result}, this.userService.authorization())
        .subscribe({
          next: () => { this.userService.updateAuthorizedUser(); this.loading = false; },
          error: () => { this.loading = false; },
        });
    });

    reader.readAsDataURL(file);
  }
}
