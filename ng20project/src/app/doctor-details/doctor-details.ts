import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/userservices';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-details',
  templateUrl: './doctor-details.html',
  styleUrls: ['./doctor-details.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class DoctorDetails implements OnInit {
  doctorDetailsForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  userId: number = 0;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get userId from localStorage (stored during registration)
    const storedUserId = localStorage.getItem('registeredUserId');
    if (!storedUserId) {
      this.errorMessage = 'User session not found. Please register again.';
      setTimeout(() => this.router.navigate(['/register']), 2000);
      return;
    }
    this.userId = parseInt(storedUserId);

    this.doctorDetailsForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      specialisation: ['', [Validators.required]],
      hpid: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{6,15}$/)]],
      contactNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  onSubmit(): void {
    if (this.doctorDetailsForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    const doctorDetails = this.doctorDetailsForm.value;

    this.userService.addDoctorDetails(this.userId, doctorDetails).subscribe({
      next: (response) => {
        this.successMessage = 'Doctor details saved successfully!';
        this.errorMessage = '';
        
        // Clear the stored userId
        localStorage.removeItem('registeredUserId');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.successMessage = '';
        if (error.status === 404) {
          this.errorMessage = 'User not found. Please register again.';
        } else if (error.status === 409) {
          this.errorMessage = 'Doctor details already exist.';
        } else {
          this.errorMessage = error.error || 'Failed to save doctor details. Please try again.';
        }
      }
    });
  }

  skipForNow(): void {
    localStorage.removeItem('registeredUserId');
    this.router.navigate(['/login']);
  }
}