import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ChatComponent} from "./components/chat/chat.component";
import {UserRegistrationComponent} from "./components/user-registration/user-registration.component";
import {NewsComponent} from "./components/news/news.component";
import {AddNewsComponent} from "./components/add-news/add-news.component";
import {LoginComponent} from "./components/login/login.component";
import {UserManageComponent} from "./components/user-manage/user-manage.component";

const routes: Routes = [
  {path: 'registration', component: UserRegistrationComponent},
  {path: 'news', component: NewsComponent},
  {path: 'add-news', component: AddNewsComponent},
  {path: 'login', component: LoginComponent},
  {path: 'manage', component: UserManageComponent},
  {path: 'chat', component: ChatComponent},
  {path: '', redirectTo: '/login', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
