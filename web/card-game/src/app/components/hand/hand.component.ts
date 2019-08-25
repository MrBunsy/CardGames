import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Card } from 'src/app/models/card';
import { DeckService } from 'src/app/services/deck.service';

class DrawableCard {
  constructor(public card: Card, public clickable: boolean, public highlight: boolean) {

  }
}

@Component({
  selector: 'hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.css']
})
export class HandComponent implements OnInit, OnChanges {


  @Input() cards: Card[];
  @Input() active: boolean = false;
  //if provided, specific cards are highlighted and only those can be played
  @Input() validPlays: Card[] = null;
  @Input() compact: boolean = true;
  @Input() vertical: boolean = false;

  @Output() cardChosen: EventEmitter<Card> = new EventEmitter<Card>();

  public drawableCards: DrawableCard[] = [];

  public style: string;

  constructor(private deckService: DeckService) {
    this.style = deckService.getStyle();
  }

  public tryCardChoose(card: Card) {
    if (this.active && (this.validPlays == null || this.validPlays.findIndex(test => test.equals(card)) >= 0)) {
      //we can choose cards, and this one is a valid choice
      this.cardChosen.emit(card)
    }
  }

  private reconfigure() {
    let newDrawableCards = [];
    let cards = this.deckService.sort(this.cards.slice());

    for (let card of cards) {
      let clickable = false;
      let highlighted = false;

      if (this.validPlays != null) {
        //there are only some cards clicable
        if (this.validPlays.findIndex(test => test.equals(card)) >= 0) {
          //this card is in the valid play list
          highlighted = true;
          clickable = this.active;
        }
      } else {
        //all cards could be active
        clickable = this.active;
      }
      // TODO finish faffage to stop angular making everything vanish briefly whenever the cards change

      newDrawableCards.push(new DrawableCard(card, clickable, highlighted));
      // let index = this.drawableCards.findIndex(drawable => drawable.card.equals(card));
      // if (index >= 0) {
      //   this.drawableCards[index].clickable = clickable;
      //   this.drawableCards[index].highlight = highlighted;
      // }else{
      //   this.drawableCards.push(new DrawableCard(card, clickable, highlighted));
      // }
    }
    // console.log(JSON.stringify(newDrawableCards))
    this.drawableCards = newDrawableCards;

    // for(let drawable of this.drawableCards){
    //   let index = this.cards.findIndex(card => card.equals(drawable.card))
    //   if(index < 0){
    //     //this card has gone
    //     this.drawableCards.splice(index,1);
    //   }
    // }
  }

  ngOnInit() {

    this.reconfigure();


  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reconfigure();
  }

}
