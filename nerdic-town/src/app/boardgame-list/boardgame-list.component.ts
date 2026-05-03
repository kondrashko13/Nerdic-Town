import { Component } from '@angular/core';
import {BoardgameService} from '../services/boardgame/boardgame.service';
import {BoardgameCardComponent} from '../boardgame-card/boardgame-card.component';

@Component({
  selector: 'app-boardgame-list',
  imports: [
    BoardgameCardComponent
  ],
  templateUrl: './boardgame-list.component.html',
  styleUrl: './boardgame-list.component.scss'
})
export class BoardgameListComponent {
  constructor(
    protected boardgameService: BoardgameService
  ) {}

  ngOnInit() {
    this.boardgameService.loadAllBoardgames();
  }
}
