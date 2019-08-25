import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TricksWonTrackerComponent } from './tricks-won-tracker.component';

describe('TricksWonTrackerComponent', () => {
  let component: TricksWonTrackerComponent;
  let fixture: ComponentFixture<TricksWonTrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TricksWonTrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TricksWonTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
