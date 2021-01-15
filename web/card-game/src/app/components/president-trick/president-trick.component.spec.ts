import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresidentTrickComponent } from './president-trick.component';

describe('PresidentTrickComponent', () => {
  let component: PresidentTrickComponent;
  let fixture: ComponentFixture<PresidentTrickComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresidentTrickComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresidentTrickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
