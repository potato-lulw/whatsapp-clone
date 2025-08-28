import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FontAwesomeModule],
  template: '<router-outlet></router-outlet>',
})
export class App {
  protected readonly title = signal('Gossip!');
  private titleService = inject(Title);
  ngOnInit(): void {
    this.titleService.setTitle('Gossip!'); 
  }
}
