import { Injectable, signal } from '@angular/core';
import {environmentDevelopment} from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  useGraphQL = signal<boolean>(environmentDevelopment.useGraphQl);
  graphqlUrl = signal<string>(environmentDevelopment.graphqlUrl);
  restUrl = signal<string>(environmentDevelopment.apiUrl);

  setUseGraphQlTo(useGraphQl: boolean) {
    this.useGraphQL.set(useGraphQl);
    console.log('Switched to:', this.useGraphQL() ? 'GraphQL' : 'REST');
  }
}
