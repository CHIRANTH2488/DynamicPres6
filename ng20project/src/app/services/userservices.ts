import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginDto {
  email: string;
  pswdHash: string;
}

export interface UserRegistrationDto {
  email: string;
  pswdHash: string;
  role: string;
}

export interface UserDto {
  userId: number;
  email: string;
  role: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7090/api/Users'; // Update with your API URL

  constructor(private http: HttpClient) {}

  register(data: UserRegistrationDto): Observable<void> {
    return this.http.post<void>(this.apiUrl, data);
  }

  login(data: LoginDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/login`, data);
  }
}