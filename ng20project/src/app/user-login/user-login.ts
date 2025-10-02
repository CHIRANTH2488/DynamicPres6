import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/userservices'; 

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.html',
  styleUrls: ['./user-login.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class UserLogin {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pswdHash: ['', Validators.required]
    });
  }

  onSubmit(): void {
  if (this.loginForm.invalid) {
    return;
  }

  const loginData = this.loginForm.value;
  this.userService.login(loginData).subscribe({
    next: (response) => {
      console.log('Login successful:', response);
      localStorage.setItem('user', JSON.stringify(response));
      alert('You have successfully logged in!'); // Browser alert
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      console.error('Login error:', error);
      alert('Error logging in. Please check your credentials.'); // Browser alert
    }
  });
}
}