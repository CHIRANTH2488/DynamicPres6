import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AppointmentService, AppointmentResponseDto } from '../../services/appointmentservices';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class DoctorDashboardComponent implements OnInit {
  pendingAppointments: AppointmentResponseDto[] = [];
  confirmedAppointments: AppointmentResponseDto[] = [];
  doctorId: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  rejectionReason: string = '';
  selectedAppointmentId: number | null = null;
  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDoctorId();
    this.loadAppointments();
  }

  loadDoctorId(): void {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    this.doctorId = userData.doctorId || 0;
    
    if (!this.doctorId) {
      this.errorMessage = 'Doctor information not found. Please contact administrator.';
    }
  } else {
    this.errorMessage = 'Please login to access dashboard.';
    this.router.navigate(['/login']);
  }
}

  loadAppointments(): void {
    this.isLoading = true;
    
    // Load pending appointments
    this.appointmentService.getDoctorPendingAppointments(this.doctorId).subscribe({
      next: (data) => {
        this.pendingAppointments = data;
      },
      error: (error) => {
        console.error('Error loading pending appointments:', error);
        this.errorMessage = 'Failed to load pending appointments.';
      }
    });

    // Load confirmed appointments
    this.appointmentService.getDoctorConfirmedAppointments(this.doctorId).subscribe({
      next: (data) => {
        this.confirmedAppointments = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading confirmed appointments:', error);
        this.errorMessage = 'Failed to load confirmed appointments.';
        this.isLoading = false;
      }
    });
  }

  confirmAppointment(appointmentId: number): void {
    this.appointmentService.confirmAppointment(appointmentId).subscribe({
      next: () => {
        this.successMessage = 'Appointment confirmed successfully!';
        this.loadAppointments();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error confirming appointment:', error);
        this.errorMessage = 'Failed to confirm appointment.';
      }
    });
  }

  openRejectModal(appointmentId: number): void {
    this.selectedAppointmentId = appointmentId;
    this.rejectionReason = '';
  }

  rejectAppointment(): void {
    if (!this.selectedAppointmentId) return;

    this.appointmentService.rejectAppointment(this.selectedAppointmentId, this.rejectionReason).subscribe({
      next: () => {
        this.successMessage = 'Appointment rejected.';
        this.loadAppointments();
        this.selectedAppointmentId = null;
        this.rejectionReason = '';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error rejecting appointment:', error);
        this.errorMessage = 'Failed to reject appointment.';
      }
    });
  }
}