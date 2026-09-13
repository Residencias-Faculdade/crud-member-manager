import { Component, signal } from '@angular/core';
import { MemberManager } from './features/member-manager/member-manager';

@Component({
  selector: 'app-root',
  imports: [MemberManager],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('member-manager');
}
