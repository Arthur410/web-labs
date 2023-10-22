import { TestBed } from '@angular/core/testing';

import { FriendNewsService } from './friend-news.service';

describe('FriendNewsService', () => {
  let service: FriendNewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendNewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
