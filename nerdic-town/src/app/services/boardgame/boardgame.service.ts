import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Boardgame, formatImageUrl} from './boardgame';
import {ConfigService} from '../config.service';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BoardgameService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  boardgames = signal<Boardgame[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  loadAllBoardgames() {
    this.isLoading.set(true);
    let request$;

    if (this.config.useGraphQL()) {
      const query = `
        query {
          boardgames {
            id
            name
            image
            players
            playtime
            age
            description
          }
        }
      `;
      request$ = this.http.post<{ data: { boardgames: Boardgame[] } }>(
        this.config.graphqlUrl(),
        { query }
      ).pipe(map(res => res.data.boardgames));
    } else {
      request$ = this.http.get<Boardgame[]>(`${this.config.restUrl()}/boardgame`);
    }

    request$.subscribe({
      next: (data) => {
        this.boardgames.set(data.map(game => formatImageUrl(game)));
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load board games.');
        this.isLoading.set(false);
      }
    });
  }

  addBoardgame(game: Partial<Boardgame>) {
    let request$;

    if (this.config.useGraphQL()) {
      const query = `
        mutation CreateBoardgame($name: String!, $image: String!, $players: String!, $playtime: Int!, $age: String!, $description: String!) {
          createBoardgame(name: $name, image: $image, players: $players, playtime: $playtime, age: $age, description: $description) {
            id
            name
            image
            players
            playtime
            age
            description
          }
        }
      `;
      request$ = this.http.post<{ data: { createBoardgame: Boardgame } }>(
        this.config.graphqlUrl(),
        { query, variables: game },
        { withCredentials: true }
      ).pipe(map(res => res.data.createBoardgame));
    } else {
      request$ = this.http.post<Boardgame>(
        `${this.config.restUrl()}/boardgame`,
        game,
        { withCredentials: true }
      );
    }

    request$.subscribe({
      next: (newGame) => {
        const formatted = formatImageUrl(newGame);
        this.boardgames.update(current => [...current, formatted]);
      },
      error: () => this.error.set('Could not add game.')
    });
  }

  updateBoardgame(id: string, changes: Partial<Boardgame>) {
    let request$;

    if (this.config.useGraphQL()) {
      const query = `
        mutation UpdateBoardgame($id: ID!, $name: String, $image: String, $players: String, $playtime: Int, $age: String, $description: String) {
          updateBoardgame(id: $id, name: $name, image: $image, players: $players, playtime: $playtime, age: $age, description: $description) {
            id
            name
            image
            players
            playtime
            age
            description
          }
        }
      `;
      request$ = this.http.post<{ data: { updateBoardgame: Boardgame } }>(
        this.config.graphqlUrl(),
        { query, variables: { id, ...changes } },
        { withCredentials: true }
      ).pipe(map(res => res.data.updateBoardgame));
    } else {
      request$ = this.http.put<Boardgame>(
        `${this.config.restUrl()}/boardgame/${id}`,
        changes,
        { withCredentials: true }
      );
    }

    request$.subscribe({
      next: (updatedGame) => {
        const formatted = formatImageUrl(updatedGame);
        this.boardgames.update(current =>
          current.map(g => (g._id === id || g.id === id) ? formatted : g)
        );
      },
      error: () => this.error.set('Update failed.')
    });
  }

  deleteBoardgame(id: string) {
    let request$;

    if (this.config.useGraphQL()) {
      const query = `
        mutation DeleteBoardgame($id: ID!) {
          deleteBoardgame(id: $id)
        }
      `;
      request$ = this.http.post(
        this.config.graphqlUrl(),
        { query, variables: { id } },
        { withCredentials: true }
      );
    } else {
      request$ = this.http.delete(
        `${this.config.restUrl()}/boardgame/${id}`,
        { withCredentials: true }
      );
    }

    request$.subscribe({
      next: () => {
        this.boardgames.update(current => current.filter(g => g._id !== id && g.id !== id));
      },
      error: () => this.error.set('Delete failed.')
    });
  }

  seedDatabase() {
    let request$;

    if (this.config.useGraphQL()) {
      const query = `
        mutation SeedBoardgames {
          seedBoardgames {
            message
            count
          }
        }
      `;
      request$ = this.http.post(
        this.config.graphqlUrl(),
        { query },
        { withCredentials: true }
      );
    } else {
      request$ = this.http.post(
        `${this.config.restUrl()}/boardgame/seed`,
        {},
        { withCredentials: true }
      );
    }

    request$.subscribe({
      next: () => this.loadAllBoardgames(),
      error: () => this.error.set('Seeding failed.')
    });
  }
}
