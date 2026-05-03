import { Component } from '@angular/core';
import {FiltersComponent} from '../filters/filters.component';
import {BoardgameListComponent} from '../boardgame-list/boardgame-list.component';

@Component({
  selector: 'app-home',
  imports: [
    FiltersComponent,
    BoardgameListComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
