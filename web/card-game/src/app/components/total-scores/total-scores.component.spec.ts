import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalScoresComponent } from './total-scores.component';

describe('TotalScoresComponent', () => {
  let component: TotalScoresComponent;
  let fixture: ComponentFixture<TotalScoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalScoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalScoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
