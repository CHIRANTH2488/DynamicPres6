import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRegisteration } from './user-registeration/user-registeration';
import { UserLogin } from './user-login/user-login';
import { DoctorDetails } from './doctor-details/doctor-details';
import { PatientDetails } from './patient-details/patient-details';

const routes: Routes = [
  {path: 'home', component: UserRegisteration},
  {path: 'login', component: UserLogin},
  {path: 'doctor-details', component: DoctorDetails},
  {path: 'patient-details', component: PatientDetails}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
