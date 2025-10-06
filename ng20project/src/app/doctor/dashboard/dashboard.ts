import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AppointmentService, AppointmentResponseDto, AppointmentCompletionDto } from '../../services/appointmentservices';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class DoctorDashboardComponent implements OnInit {
  activeTab: string = 'requests'; // requests, upcoming, previous
  
  pendingAppointments: AppointmentResponseDto[] = [];
  upcomingAppointments: AppointmentResponseDto[] = [];
  previousAppointments: AppointmentResponseDto[] = [];
  
  doctorId: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  
  // For rejection modal
  rejectionReason: string = '';
  selectedAppointmentId: number | null = null;
  
  // For completion modal
  completionData: AppointmentCompletionDto = {
    diagnosis: '',
    medicines: '',
    invoiceAmount: undefined
  };
  selectedCompletionAppointment: AppointmentResponseDto | null = null;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadDoctorId();
    this.loadAllAppointments();
  }

  loadDoctorId(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.doctorId = userData.doctorId || 0;
    }
  }

  loadAllAppointments(): void {
    this.isLoading = true;
    
    // Load new requests
    this.appointmentService.getDoctorPendingAppointments(this.doctorId).subscribe({
      next: (data) => {
        this.pendingAppointments = data;
      },
      error: (error) => {
        console.error('Error loading pending appointments:', error);
        this.errorMessage = 'Failed to load new appointment requests.';
      }
    });

    // Load upcoming appointments
    this.appointmentService.getDoctorUpcomingAppointments(this.doctorId).subscribe({
      next: (data) => {
        this.upcomingAppointments = data;
      },
      error: (error) => {
        console.error('Error loading upcoming appointments:', error);
        this.errorMessage = 'Failed to load upcoming appointments.';
      }
    });

    // Load previous appointments
    this.appointmentService.getDoctorPreviousAppointments(this.doctorId).subscribe({
      next: (data) => {
        this.previousAppointments = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading previous appointments:', error);
        this.errorMessage = 'Failed to load previous appointments.';
        this.isLoading = false;
      }
    });
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  confirmAppointment(appointmentId: number): void {
    this.appointmentService.confirmAppointment(appointmentId).subscribe({
      next: () => {
        this.successMessage = 'Appointment confirmed successfully!';
        this.loadAllAppointments();
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
        this.loadAllAppointments();
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

  openCompleteModal(appointment: AppointmentResponseDto): void {
    this.selectedCompletionAppointment = appointment;
    this.completionData = {
      diagnosis: '',
      medicines: '',
      invoiceAmount: undefined
    };
  }

  completeAppointment(): void {
    if (!this.selectedCompletionAppointment) return;

    this.appointmentService.completeAppointment(
      this.selectedCompletionAppointment.appointmentId, 
      this.completionData
    ).subscribe({
      next: () => {
        this.successMessage = 'Appointment marked as completed!';
        this.loadAllAppointments();
        this.selectedCompletionAppointment = null;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error completing appointment:', error);
        this.errorMessage = 'Failed to complete appointment.';
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}