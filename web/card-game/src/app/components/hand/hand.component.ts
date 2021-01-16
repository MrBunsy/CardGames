import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, IterableChanges, IterableDiffer, IterableDiffers } from '@angular/core';
import { Card } from 'src/app/models/card';
import { DeckService } from 'src/app/services/deck.service';
import { Deck } from 'src/app/models/deck';

class DrawableCard {
  constructor(public card: Card, public clickable: boolean, public highlight: boolean) {

  }
}
/**
 * See also https://anotherdevblog.com/2019/06/30/when-ngonchanges-is-not-enough/
 * since this needs to check changes in an input array
 * 
 * 
 */
@Component({
  selector: 'hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.css']
})
export class HandComponent implements OnInit, OnChanges {


  @Input() cards: Card[] = null;
  @Input() cardCount: number = -1;
  @Input() active: boolean = false;
  //if provided, specific cards are highlighted and only those can be played
  @Input() validPlays: Card[] = null;
  @Input() compact: boolean = true;
  @Input() vertical: boolean = false;
  @Input() sortGroupSuits: boolean = true;

  @Output() cardChosen: EventEmitter<Card> = new EventEmitter<Card>();

  public drawableCards: DrawableCard[] = [];

  public style: string;

  private _diff: IterableDiffer<Card>;

  constructor(private _iterableDiffers: IterableDiffers, private deckService: DeckService) {
    this.style = deckService.getStyle();
  }

  public tryCardChoose(card: Card) {
    if (this.active && (this.validPlays == null || this.validPlays.findIndex(test => test.equals(card)) >= 0)) {
      //we can choose cards, and this one is a valid choice
      this.cardChosen.emit(card)
    }
  }

  /**
   * Note - if we just directly replace the drawable cards array, we get blips where there are no cards
   * so some extra faff occurs here so we update elements in the array or add/remove as necessary
   */
  private reconfigure() {
    if (this.cards === null && this.cardCount < 0) {
      this.drawableCards = [];
      return;
    }

    if (this.cards === null && this.cardCount >= 0) {
      //given only a count of cards, so assume face down

      if (this.drawableCards.length == this.cardCount) {
        //no change
        return;
      }
      if (this.drawableCards.length > this.cardCount) {
        //remove some
        this.drawableCards.splice(0, this.drawableCards.length - this.cardCount);
        return;
      }

      let drawableCards = [];
      for (let i = 0; i < this.cardCount; i++) {

        drawableCards.push(new DrawableCard(new Card("Clubs", 2, false), false, false));

      }
      this.drawableCards = drawableCards;
      return;
    }

    // let newDrawableCards = [];
    let cards = Deck.sort(this.cards.slice(), this.sortGroupSuits);


    let i = 0;
    for (let card of cards) {
      let clickable = false;
      let highlighted = false;

      //bodge so all cards appear unique for the don't-break-angular don't-replace-the-array bodge
      if (!card.faceUp) {
        card.value = i;
        i++;
      }

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
      // faffage to stop angular making everything vanish briefly whenever the cards change

      // newDrawableCards.push(new DrawableCard(card, clickable, highlighted));
      let index = this.drawableCards.findIndex(drawable => drawable.card.equals(card));
      if (index >= 0) {
        this.drawableCards[index].clickable = clickable;
        this.drawableCards[index].highlight = highlighted;
      } else {
        this.drawableCards.push(new DrawableCard(card, clickable, highlighted));
      }


    }


    for (let drawable of this.drawableCards) {
      let index = this.cards.findIndex(card => card.equals(drawable.card))
      if (index < 0) {
        //this card has gone
        this.drawableCards.splice(this.drawableCards.indexOf(drawable), 1);
      }
    }
  }

  ngOnInit() {
    // this._diff = this._iterableDiffers.find(this.cards).create();
    this.reconfigure();


  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reconfigure();
  }

  public ngDoCheck(): void {
    // if(this.cards == undefined){
    //   return;
    // }
    // this.reconfigure();
    // const changes: IterableChanges<Card> = this._diff.diff(this.cards);

    // if (changes) {
    //   this.reconfigure();
    // }
  }

}
