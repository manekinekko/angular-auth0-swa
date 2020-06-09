import { Component } from "@angular/core";
import { AuthService } from "./auth/auth0.service";

@Component({
  selector: "app-root",
  template: `
    <header>
      <a routerLink="/"> <span>GITHU</span><span>BADGE</span> </a>
      <span></span>
      <button class="btn" (click)="logout()" *ngIf="auth.loggedIn">LOG OUT</button>
    </header>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
      :host {
        height: 100%;
        width: 100%;
      }

      header {
        background-color: black;
        color: white;
        display: flex;
        padding: 10px;
      }

      header span {
        flex: 1;
      }

      header a {
        color: white;
        display: flex;
        align-items: center;
        text-decoration: none;
      }

      header span:last-child {
        color: lightcoral;
      }

      .btn {
        border: 1px solid white;
        background: transparent;
        color: white;
        padding: 5px 15px;
      }
    `,
  ],
})
export class AppComponent {
  constructor(public auth: AuthService) {}

  ngOnInit() {}

  logout() {
    this.auth.logout();
  }
}
