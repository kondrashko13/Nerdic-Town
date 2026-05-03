import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, tap} from 'rxjs/operators';
import {AuthResponse, LoginCredentials, RegisterResponse} from './auth';
import {ConfigService} from '../config.service';
import {UserService} from '../user/user.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private user = inject(UserService);
  private router = inject(Router);

  currentUser = signal<{ userId: string; role: string } | null>(null);

  isLoggedIn = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    if (role && userId) {
      this.currentUser.set({ userId, role });
      this.user.fetchProfile().subscribe();
    }
  }

  register(credentials: LoginCredentials) {
    if (this.config.useGraphQL()) {
      const query = `
        mutation Register($email: String!, $password: String!) {
          register(email: $email, password: $password) {
            message
            userId
          }
        }
      `;

      return this.http.post<{ data: { register: RegisterResponse } }>(
        this.config.graphqlUrl(),
        { query, variables: credentials }
      ).pipe(
        map(res => res.data.register)
      );
    } else {
      return this.http.post<RegisterResponse>(
        `${this.config.restUrl()}/auth/register`,
        credentials
      );
    }
  }

  login(credentials: LoginCredentials) {
    if (this.config.useGraphQL()) {
      const query = `
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            message
            userId
            role
          }
        }
      `;

      return this.http.post<{ data: { login: AuthResponse } }>(
        this.config.graphqlUrl(),
        { query, variables: credentials },
        { withCredentials: true }
      ).pipe(
        map(res => res.data.login),
        this.handleLoginSuccess()
      );
    } else {
      return this.http.post<AuthResponse>(
        `${this.config.restUrl()}/auth/login`,
        credentials,
        { withCredentials: true }
      ).pipe(
        this.handleLoginSuccess()
      );
    }
  }

  logout() {
    if (this.config.useGraphQL()) {
      const query = `
        mutation Logout {
          logout {
            message
          }
        }
      `;

      return this.http.post(
        this.config.graphqlUrl(),
        { query },
        { withCredentials: true }
      ).pipe(
        this.handleLogoutSuccess()
      );

    } else {
      return this.http.post(
        `${this.config.restUrl()}/auth/logout`,
        {},
        { withCredentials: true }
      ).pipe(
        this.handleLogoutSuccess()
      );
    }
  }

  private handleLoginSuccess() {
    return tap((res: AuthResponse) => {
      localStorage.setItem('userId', res.userId);
      localStorage.setItem('role', res.role);
      this.currentUser.set({ userId: res.userId, role: res.role });
    });
  }

  private handleLogoutSuccess() {
    return tap(() => {
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      this.currentUser.set(null);
      this.router.navigate(['/login']);
    });
  }
}
