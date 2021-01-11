import { Component, Input, OnInit } from '@angular/core';
import { PresidentPlayer } from 'src/app/models/PresidentPlayer';

@Component({
  selector: 'president-table',
  templateUrl: './president-table.component.html',
  styleUrls: ['./president-table.component.css']
})
export class PresidentTableComponent implements OnInit {

  @Input() players: PresidentPlayer[];
  constructor() { }

  ngOnInit() {
  }

}
