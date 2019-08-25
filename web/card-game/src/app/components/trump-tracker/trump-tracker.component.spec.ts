import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrumpTrackerComponent } from './trump-tracker.component';

describe('TrumpTrackerComponent', () => {
  let component: TrumpTrackerComponent;
  let fixture: ComponentFixture<TrumpTrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrumpTrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrumpTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
