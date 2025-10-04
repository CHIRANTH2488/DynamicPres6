import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/userservices';
import { CaptchaComponent } from '../captcha/captcha'; // Import CAPTCHA

@Component({
  selector: 'app-user-registeration',
  templateUrl: './user-registeration.html',
  styleUrls: ['./user-registeration.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CaptchaComponent] // Add CaptchaComponent
})
export class UserRegisteration {
  registrationForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isCaptchaValid: boolean = false;
  
  @ViewChild(CaptchaComponent) captchaComponent!: CaptchaComponent;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pswdHash: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  onCaptchaValidated(isValid: boolean): void {
    this.isCaptchaValid = isValid;
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      return;
    }

    // Validate CAPTCHA before submitting
    this.captchaComponent.validateCaptcha();
    
    if (!this.isCaptchaValid) {
      this.errorMessage = 'Please complete the CAPTCHA verification.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const registrationData = this.registrationForm.value;
    this.userService.register(registrationData).subscribe({
      next: () => {
        console.log('Registration successful');
        this.successMessage = 'Registration successful! Redirecting to login...';
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = 'Registration failed. Please try again.';
        this.isCaptchaValid = false;
        this.captchaComponent.refreshCaptcha();
      }
    });
  }
}