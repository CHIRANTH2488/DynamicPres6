import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';

interface Medicine {
  slNo: number;
  name: string;
  morningBefore: number;
  morningAfter: number;
  afternoonBefore: number;
  afternoonAfter: number;
  nightBefore: number;
  nightAfter: number;
  days: number;
}

@Component({
  selector: 'app-prescription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css']
})
export class PrescriptionComponent implements OnInit {
  @Input() appointmentId!: number;
  @Input() doctorId!: number;
  @Input() patient: any = { name: '', age: 0, id: '', date: new Date() };
  @Input() doctor: any = { name: '', info: '' };
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  isEditMode = true;
  chiefComplaints = '';
  pastHistory = '';
  examination = '';
  advice = '';
  medicines: Medicine[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPrescription();
    if (!this.patient.name || !this.doctor.name) {
      this.fetchPatientData();
      this.fetchDoctorData();
    }
    if (!this.medicines.length) {
      this.addMedicine();
    }
  }

  fetchPatientData() {
    this.http.get(`https://localhost:7090/api/Appointments/patient-data`, {
      params: { appointmentId: this.appointmentId, userId: this.doctorId, userRole: 'Doctor' }
    }).subscribe({
      next: (data: any) => {
        this.patient = {
          name: data.fullName,
          age: this.calculateAge(data.dob),
          id: data.aadhaar_no,
          date: new Date(data.appointmentDate)
        };
      },
      error: (err) => console.error('Error fetching patient:', err)
    });
  }

  fetchDoctorData() {
    this.http.get(`https://localhost:7090/api/Doctors/${this.doctorId}`).subscribe({
      next: (data: any) => {
        this.doctor = {
          name: data.fullName,
          info: data.specialisation
        };
      },
      error: (err) => console.error('Error fetching doctor:', err)
    });
  }

  loadPrescription() {
    this.http.get(`https://localhost:7090/api/Appointments/${this.appointmentId}/prescription`)
      .subscribe({
        next: (prescription: any) => {
          this.chiefComplaints = prescription.ChiefComplaints || '';
          this.pastHistory = prescription.PastHistory || '';
          this.examination = prescription.Examination || '';
          this.advice = prescription.Advice || '';
          this.medicines = prescription.Medicines && prescription.Medicines.length
            ? prescription.Medicines.map((m: any, i: number) => ({
                slNo: m.SlNo || i + 1,
                name: m.Name || '',
                morningBefore: m.MorningBefore || 0,
                morningAfter: m.MorningAfter || 0,
                afternoonBefore: m.AfternoonBefore || 0,
                afternoonAfter: m.AfternoonAfter || 0,
                nightBefore: m.NightBefore || 0,
                nightAfter: m.NightAfter || 0,
                days: m.Days || 0
              }))
            : [this.createEmptyMedicine()];
          this.isEditMode = false;
        },
        error: () => {
          this.medicines = [this.createEmptyMedicine()];
          this.isEditMode = true;
        }
      });
  }

  createEmptyMedicine(): Medicine {
    return {
      slNo: this.medicines.length + 1,
      name: '',
      morningBefore: 0,
      morningAfter: 0,
      afternoonBefore: 0,
      afternoonAfter: 0,
      nightBefore: 0,
      nightAfter: 0,
      days: 0
    };
  }

  addMedicine() {
    this.medicines.push(this.createEmptyMedicine());
  }

  removeMedicine(index: number) {
    this.medicines.splice(index, 1);
    this.medicines.forEach((med, i) => med.slNo = i + 1);
  }

  savePrescription() {
    this.isEditMode = false;
    this.save.emit({
      AppointmentId: this.appointmentId,
      ChiefComplaints: this.chiefComplaints,
      PastHistory: this.pastHistory,
      Examination: this.examination,
      Medicines: this.medicines.map(m => ({
        SlNo: m.slNo,
        Name: m.name,
        MorningBefore: m.morningBefore,
        MorningAfter: m.morningAfter,
        AfternoonBefore: m.afternoonBefore,
        AfternoonAfter: m.afternoonAfter,
        NightBefore: m.nightBefore,
        NightAfter: m.nightAfter,
        Days: m.days
      })),
      Advice: this.advice,
      Diagnosis: ''
    });
  }

  cancelEdit() {
    this.isEditMode = false;
    this.cancel.emit();
  }

  downloadPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Hospital Name', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Doctor: ${this.doctor.name || 'N/A'} - ${this.doctor.info || 'N/A'}`, 150, 30, { align: 'right' });
    doc.text(`Patient: ${this.patient.name || 'N/A'}`, 20, 50);
    doc.text(`Age: ${this.patient.age || 0}`, 20, 60);
    doc.text(`ID: ${this.patient.id || 'N/A'}`, 20, 70);
    doc.text(`Date: ${this.patient.date?.toDateString() || 'N/A'}`, 20, 80);
    doc.text('Chief Complaints & History:', 20, 90);
    doc.text(this.chiefComplaints || 'N/A', 20, 100);
    doc.text('Past History:', 20, 110);
    doc.text(this.pastHistory || 'N/A', 20, 120);
    doc.text('Examination:', 20, 130);
    doc.text(this.examination || 'N/A', 20, 140);
    doc.text('Medicines Prescribed:', 20, 150);
    let y = 160;
    this.medicines.forEach(med => {
      doc.text(`${med.slNo}. ${med.name || 'N/A'} - Morning: ${med.morningBefore}/${med.morningAfter}, Afternoon: ${med.afternoonBefore}/${med.afternoonAfter}, Night: ${med.nightBefore}/${med.nightAfter}, Days: ${med.days}`, 20, y);
      y += 10;
    });
    doc.text('Advice & Follow-Up:', 20, y + 10);
    doc.text(this.advice || 'N/A', 20, y + 20);
    doc.text(`Doctor: ${this.doctor.name || 'N/A'}`, 150, y + 40, { align: 'right' });
    doc.text('Hospital Footer Info', 105, 280, { align: 'center' });
    doc.save('prescription.pdf');
  }

  private calculateAge(dob: string): number {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}