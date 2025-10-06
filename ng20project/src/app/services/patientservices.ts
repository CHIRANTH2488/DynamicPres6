import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PatientProfile {
  patientId: number;
  userId: number;
  fullName: string;
  dob?: string; 
  gender?: string;
  contactNo?: string;
  address?: string;
  Aadhaar_no?: string;  
}

export interface PatientUpdateDto {
  patientId: number;
  userId: number;  // Not optional
  fullName: string;
  dob?: string | null;
  gender?: string;
  contactNo?: string;
  address?: string;
  aadhaarNo?: string;  // Make sure it's camelCase
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'https://localhost:7090/api/Patients';

  constructor(private http: HttpClient) {}

  getPatientProfile(patientId: number): Observable<PatientProfile> {
    return this.http.get<PatientProfile>(`${this.apiUrl}/${patientId}`);
  }

  updatePatientProfile(patientId: number, data: PatientUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${patientId}`, data);
  }
}