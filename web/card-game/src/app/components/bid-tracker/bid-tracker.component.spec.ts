import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BidTrackerComponent } from './bid-tracker.component';

describe('BidTrackerComponent', () => {
  let component: BidTrackerComponent;
  let fixture: ComponentFixture<BidTrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BidTrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
