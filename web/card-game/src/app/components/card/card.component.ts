import { Component, OnInit, Input, ViewEncapsulation, OnChanges, SimpleChanges } from '@angular/core';
import { DeckService } from 'src/app/services/deck.service';
import { Card } from 'src/app/models/card';

/**
 * Component to render a single card, by itself.
 */
@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CardComponent implements OnInit, OnChanges {


  public image: string;
  @Input() card: Card;

  constructor(private deck: DeckService) {

  }

  private setImage() {
    this.image = this.deck.getStyle() + "/" + this.card.toString() + ".svg";
  }

  ngOnInit() {
    this.setImage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setImage();
  }

}
