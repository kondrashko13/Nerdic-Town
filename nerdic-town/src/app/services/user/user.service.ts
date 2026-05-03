import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import {User} from './user';
import {ConfigService} from '../config.service';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  userProfile = signal<User | null>(null);
  allUsers = signal<User[]>([]);
  isLoading = signal<boolean>(false);

  fetchProfile() {
    this.isLoading.set(true);
    let request$;

    if (this.config.useGraphQL()) {
      const query = `
        query {
          profile {
            id
            email
            role
          }
        }
      `;
      request$ = this.http.post<{ data: { profile: User } }>(
        this.config.graphqlUrl(),
        { query },
        { withCredentials: true }
      ).pipe(map(res => res.data.profile));
    } else {
      request$ = this.http.get<User>(
        `${this.config.restUrl()}/user/profile`,
        { withCredentials: true }
      );
    }

    return request$.pipe(
      tap((user) => {
        this.userProfile.set(user);
        this.isLoading.set(false);
      })
    );
  }

  updateProfile(email: string) {
    let request$;

    if (this.config.useGraphQL()) {
      const query = `
        mutation UpdateProfile($email: String!) {
          updateProfile(email: $email) {
            id
            email
            role
          }
        }
      `;
      request$ = this.http.post<{ data: { updateProfile: User } }>(
        this.config.graphqlUrl(),
        { query, variables: { email } },
        { withCredentials: true }
      ).pipe(map(res => res.data.updateProfile));
    } else {
      request$ = this.http.put<User>(
        `${this.config.restUrl()}/user/profile`,
        { email },
        { withCredentials: true }
      );
    }

    return request$.pipe(
      tap((updatedUser) => {
        this.userProfile.set(updatedUser);
      })
    );
  }

  fetchAllUsers() {
    this.isLoading.set(true);
    let request$;

    if (this.config.useGraphQL()) {
      const query = `
        query {
          users {
            id
            email
            role
          }
        }
      `;
      request$ = this.http.post<{ data: { users: User[] } }>(
        this.config.graphqlUrl(),
        { query },
        { withCredentials: true }
      ).pipe(map(res => res.data.users));
    } else {
      request$ = this.http.get<User[]>(
        `${this.config.restUrl()}/user`,
        { withCredentials: true }
      );
    }

    request$.subscribe({
      next: (users) => {
        this.allUsers.set(users);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  deleteUser(id: string) {
    let request$;

    if (this.config.useGraphQL()) {
      const query = `
        mutation DeleteUser($id: ID!) {
          deleteUser(id: $id)
        }
      `;
      request$ = this.http.post<{ data: { deleteUser: boolean } }>(
        this.config.graphqlUrl(),
        { query, variables: { id } },
        { withCredentials: true }
      );
    } else {
      request$ = this.http.delete(
        `${this.config.restUrl()}/user/${id}`,
        { withCredentials: true }
      );
    }

    return request$.pipe(
      tap(() => {
        this.allUsers.update(users => users.filter(u => u._id !== id && u.id !== id));
      })
    );
  }
}
