import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService, PatientProfile } from '../../services/patientservices';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class PatientProfileComponent implements OnInit {
  profileForm: FormGroup;
  patientId: number = 0;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  patientData: PatientProfile | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      dob: [''],
      gender: [''],
      contactNo: ['', [Validators.pattern(/^\d{10}$/)]],
      address: [''],
      aadhaarNo: ['', [Validators.pattern(/^\d{12}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadPatientId();
    this.loadProfile();
    this.profileForm.disable(); // Start in view mode
  }

  loadPatientId(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.patientId = userData.patientId || 0;
      
      if (!this.patientId) {
        this.errorMessage = 'Patient profile not found.';
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadProfile(): void {
    if (!this.patientId) return;

    this.isLoading = true;
    this.patientService.getPatientProfile(this.patientId).subscribe({
      next: (data) => {
        this.patientData = data;
        this.profileForm.patchValue({
          fullName: data.fullName,
          dob: data.dob ? data.dob.split('T')[0] : '',
          gender: data.gender,
          contactNo: data.contactNo,
          address: data.address,
          aadhaarNo: data.aadhaarNo
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Failed to load profile.';
        this.isLoading = false;
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      this.loadProfile(); // Reload to reset any changes
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData = this.profileForm.value;

    this.patientService.updatePatientProfile(this.patientId, updateData).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        this.isEditMode = false;
        this.profileForm.disable();
        this.isLoading = false;
        
        // Update localStorage with new name
        const user = localStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          userData.fullName = updateData.fullName;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = 'Failed to update profile.';
        this.isLoading = false;
      }
    });
  }
}