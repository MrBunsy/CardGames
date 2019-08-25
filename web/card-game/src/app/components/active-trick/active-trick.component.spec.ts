import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveTrickComponent } from './active-trick.component';

describe('ActiveTrickComponent', () => {
  let component: ActiveTrickComponent;
  let fixture: ComponentFixture<ActiveTrickComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveTrickComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveTrickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
