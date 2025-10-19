import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-prescription',
  standalone:false,
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css']
})
export class PrescriptionComponent implements OnInit {
  @Input() appointmentId!: number;
  @Input() doctorId!: number;

  isEditMode = false;
  patient: any = {};
  doctor: any = {};
  diagnosis = '';
  history = '';
  pastHistory = '';
  advice = '';
  medicines: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPatientData();
    this.fetchDoctorData();
  }

  fetchPatientData() {
    this.http.get<any>(`https://localhost:7090/api/Appointments/patient-data`, {
      params: {
        appointmentId: this.appointmentId,
        userId: this.doctorId,
        userRole: 'Doctor'
      }
    }).subscribe(data => {
      this.patient = data;
    });
  }

  fetchDoctorData() {
    this.http.get<any>(`https://localhost:7090/api/Doctors/${this.doctorId}`).subscribe(data => {
      this.doctor = data;
    });
  }

  addMedicine() {
    this.medicines.push({
      name: '',
      morning: { before: 0, after: 0 },
      afternoon: { before: 0, after: 0 },
      night: { before: 0, after: 0 },
      days: 0
    });
  }

  savePrescription() {
    this.isEditMode = false;

    const prescription = {
      appointmentId: this.appointmentId,
      diagnosis: this.diagnosis,
      history: this.history,
      pastHistory: this.pastHistory,
      advice: this.advice,
      medicines: this.medicines
    };

    this.http.post('https://localhost:7090/api/Appointments/save-prescription', prescription)
      .subscribe({
        next: () => alert('Prescription saved successfully.'),
        error: err => alert('Error saving prescription: ' + err.message)
      });
  }

  cancelEdit() {
    this.isEditMode = false;
  }

  downloadPDF() {
    const element = document.getElementById('prescription');
    if (element) {
      import('html2pdf.js').then(html2pdf => {
        html2pdf.default().from(element).save('Prescription.pdf');
      });
    }
  }
}
