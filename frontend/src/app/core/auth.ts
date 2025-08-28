import { inject, Injectable } from '@angular/core';
import { User } from '../models/User';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/api/v1/users';
  private router = inject(Router);
  getUser() {
    const user = localStorage.getItem('loggedUser');
    return user ? JSON.parse(user) : null;
  }

  getUserId () {
    const user = this.getUser();
    return user ? user.id : null;
  }

  setUser(user: User) {
    localStorage.setItem('loggedUser', JSON.stringify(user));
  }

  clearUser() {
    localStorage.removeItem('loggedUser');
  }

  login(email: string, password: string) {
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true } // important for cookies
    );
  }

  register(name: string, email: string, password: string, isAdmin: boolean) {
    return this.http.post<any>(
      `${this.apiUrl}/register`,
      { name, email, password, isAdmin },
      { withCredentials: true }
    );
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.clearUser();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error("❌ Logout failed:", err);
        // still clear locally, just in case
        this.clearUser();
        this.router.navigate(['/login']);
      }
    });

  }
}
