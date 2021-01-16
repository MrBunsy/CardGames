import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresidentScoresComponent } from './president-scores.component';

describe('PresidentScoresComponent', () => {
  let component: PresidentScoresComponent;
  let fixture: ComponentFixture<PresidentScoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresidentScoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresidentScoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
