import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRegisteration } from './user-registeration/user-registeration';
import { UserLogin } from './user-login/user-login';

const routes: Routes = [
  {path: 'home', component: UserRegisteration},
  {path: 'login', component: UserLogin},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
