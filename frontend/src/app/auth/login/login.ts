import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../core/auth';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmButton } from '@spartan-ng/helm/button';
import { ThemeToggle } from "../../shared/components/theme/theme-toggle/theme-toggle";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HlmInput, HlmButton, ThemeToggle],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  protected readonly title = signal('Login to Gossip!');
  loginForm: FormGroup;
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  loginError: string | null = null;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.authService.setUser(response.user);
        this.router.navigate(['/']); // Navigate to the home page or dashboard
      },
      error: (err) => {
        this.loginError = 'Invalid email or password.';
        console.error('Login failed:', err);
      }
    });
  }
  
}
