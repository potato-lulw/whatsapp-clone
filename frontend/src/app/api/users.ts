import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly apiRoute = `${environment.apiUrl}/api/v1/users`;

  constructor(private http: HttpClient) {}

  getUserByEmail(email: string) {
    return this.http.get<{ message: String, user: User }>(`${this.apiRoute}/email/${email}`, {withCredentials: true}).pipe(
      map(res => res.user)
    );
  }
}
