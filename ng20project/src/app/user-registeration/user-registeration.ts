import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/userservices';
import { CaptchaComponent } from '../captcha/captcha'; 

@Component({
  selector: 'app-user-registeration',
  templateUrl: './user-registeration.html',
  styleUrls: ['./user-registeration.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CaptchaComponent] 
})

export class UserRegisteration {
  registrationForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isCaptchaValid: boolean = false;
  
  @ViewChild(CaptchaComponent) captchaComponent!: CaptchaComponent;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  pswdHash: ['', Validators.required],
  confirmPassword: ['', Validators.required],
  role: ['', Validators.required]
}, { validators: this.passwordsMatchValidator });
  }

  onCaptchaValidated(isValid: boolean): void {
    this.isCaptchaValid = isValid;
  }

  passwordsMatchValidator(form: FormGroup) {
  const password = form.get('pswdHash')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
  } else {
    form.get('confirmPassword')?.setErrors(null);
  }
  return null;
}

  onSubmit(): void {    
    if (this.registrationForm.invalid) {
      this.errorMessage = 'Please fill all fields correctly.';
      // Mark all fields as touched to show validation errors
      Object.keys(this.registrationForm.controls).forEach(key => {
        this.registrationForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.isCaptchaValid) {
      this.errorMessage = 'Please complete the CAPTCHA.';
      return;
    }

    const userData = this.registrationForm.value;

    this.userService.register(userData).subscribe({
      next: (response) => {
        this.successMessage = 'Registration successful!';
        this.errorMessage = '';
        
        // Store userId for doctor details if role is Doctor
        if (userData.role === 'Doctor') {
          localStorage.setItem('registeredUserId', response.userId.toString());
          
          // Redirect to doctor details page after 1 second
          setTimeout(() => {
            this.router.navigate(['/doctor-details']);
          }, 1000);
        }else if (userData.role === 'Patient') {
          localStorage.setItem('registeredUserId', response.userId.toString());
          
          // Redirect to patient details page after 1 second
          setTimeout(() => {
            this.router.navigate(['/patient-details']);
          }, 1000);
        }  else {
          // For Admin, redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
        
        this.registrationForm.reset();
        this.isCaptchaValid = false;
      },
      error: (error) => {
        this.successMessage = '';
        this.errorMessage = error.error || 'Registration failed. Please try again.';
      }
    });
  }
}