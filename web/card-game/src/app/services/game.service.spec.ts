import { TestBed } from '@angular/core/testing';

import { WhistGameService } from './game.service';

describe('GameService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WhistGameService = TestBed.get(WhistGameService);
    expect(service).toBeTruthy();
  });
});
