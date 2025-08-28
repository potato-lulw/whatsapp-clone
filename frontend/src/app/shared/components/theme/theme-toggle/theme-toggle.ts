import { Component, inject, signal } from '@angular/core';
import { Theme } from '../../../../core/theme';
import { MatIconModule } from '@angular/material/icon';
import { HlmButton } from "@spartan-ng/helm/button";

@Component({
  selector: 'app-theme-toggle',
  imports: [MatIconModule, HlmButton],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css'
})
export class ThemeToggle {
  private themeService  = inject(Theme);
  theme  = signal(this.themeService .currentTheme);

  toggleTheme() {
    this.themeService.toggleTheme();
    this.theme.set(this.themeService.currentTheme);
  }
}
