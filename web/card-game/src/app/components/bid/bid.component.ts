import { Component, OnInit, Input } from '@angular/core';
import { HumanPlayerService } from 'src/app/services/human-player.service';

@Component({
  selector: 'bid',
  templateUrl: './bid.component.html',
  styleUrls: ['./bid.component.css']
})
export class BidComponent implements OnInit {

  @Input() validBids: number[];

  constructor(private player: HumanPlayerService) { }

  public chooseBid(bid: number) {
    this.player.chosenBid(bid);
  }

  ngOnInit() {
  }

}
