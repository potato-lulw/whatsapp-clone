import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Theme {
  toggleTheme() {
    const html = document.documentElement;
    if(html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }
  get currentTheme(): 'light' | 'dark' {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
}
