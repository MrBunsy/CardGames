import { Component, OnInit } from '@angular/core';
import { DeckService } from 'src/app/services/deck.service';
import { Card } from 'src/app/models/card';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public deck: Card[];

  constructor(private deckService: DeckService) {

    this.deck = this.deckService.getDeck(true);

  }

  ngOnInit() {
  }

}
