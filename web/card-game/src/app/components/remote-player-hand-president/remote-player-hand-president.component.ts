import { Component, Input, OnInit } from '@angular/core';
import { PresidentPlayer } from 'src/app/models/PresidentPlayer';

@Component({
  selector: 'remote-player-hand-president',
  templateUrl: './remote-player-hand-president.component.html',
  styleUrls: ['./remote-player-hand-president.component.css']
})
export class RemotePlayerHandPresidentComponent implements OnInit {

  @Input() player: PresidentPlayer;
  @Input() openHand: boolean;

  constructor() { }

  ngOnInit() {
  }

}
