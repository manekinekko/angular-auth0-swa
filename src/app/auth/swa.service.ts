import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, from, Observable, throwError } from "rxjs";
import { catchError, concatMap, shareReplay, tap } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { Auth, ClientPrincipal } from "./auth.interface";

@Injectable({
  providedIn: "root",
})
export class AuthSWAService implements Auth {
  private authClient$ = (from(this.authProvider()) as Observable<ClientPrincipal | null>).pipe(
    shareReplay(1),
    catchError((err) => throwError(err))
  );

  public isAuthenticated$ = this.authClient$.pipe(
    concatMap((user) => from(Promise.resolve(!!user))),
    tap((res) => (this.loggedIn = res))
  );

  private userProfileSubject$ = new BehaviorSubject<ClientPrincipal>(null);
  private handleRedirectCallback$ = this.authClient$.pipe(concatMap((user) => from(Promise.resolve(true))));
  public userProfile$ = this.userProfileSubject$.asObservable();
  public loggedIn: boolean = null;

  constructor(private window: Window) {
    this.handleAuthCallback();
  }
  login(redirect = "/profile") {
    const url = environment?.swaAuth?.github?.login;
    this.window.location.href = `${url}?post_login_redirect_uri=${redirect}`;
  }

  logout(redirect = "/") {
    const url = environment?.swaAuth?.github?.logout;
    this.window.location.href = `${url}?post_logout_redirect_uri=${redirect}`;
  }

  getUser$(options?) {
    return this.authClient$.pipe(tap((user) => this.userProfileSubject$.next(user)));
  }

  async authProvider(): Promise<ClientPrincipal> {
    try {
      const response = await fetch("/.auth/me");
      const payload = (await response.json()) as { clientPrincipal: ClientPrincipal };
      const { clientPrincipal } = payload;
      return {
        ...clientPrincipal,
        nickname: clientPrincipal.userDetails,
      };
    } catch (error) {
      return null;
    }
  }

  private handleAuthCallback() {
    const authComplete$ = this.handleRedirectCallback$.pipe(
      concatMap(() => {
        return combineLatest([this.getUser$(), this.isAuthenticated$]);
      })
    );

    authComplete$.subscribe(([user, loggedIn]) => {});
  }
}
