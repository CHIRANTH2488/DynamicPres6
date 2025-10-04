import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { UserLogin } from './user-login/user-login';
import { UserRegisteration } from './user-registeration/user-registeration';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CaptchaComponent } from './captcha/captcha';
import { DoctorDetails } from './doctor-details/doctor-details';
import { PatientDetails } from './patient-details/patient-details';

@NgModule({
  declarations: [
    App,
    PatientDetails
  ],
  imports: [
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    UserLogin,
    UserRegisteration,
    DoctorDetails,
    CaptchaComponent
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient()
  ],
  bootstrap: [App]
})
export class AppModule { }
