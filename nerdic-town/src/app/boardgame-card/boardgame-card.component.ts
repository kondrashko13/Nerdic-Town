import {Component, Input} from '@angular/core';
import {Boardgame} from '../services/boardgame/boardgame';

@Component({
  selector: 'app-boardgame-card',
  imports: [],
  templateUrl: './boardgame-card.component.html',
  styleUrl: './boardgame-card.component.scss'
})
export class BoardgameCardComponent {
  @Input({ required: true }) game!: Boardgame;
}
