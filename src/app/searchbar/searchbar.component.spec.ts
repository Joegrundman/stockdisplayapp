/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { SearchbarComponent } from './searchbar.component';

describe('SearchbarComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        SearchbarComponent
      ],
    });
  });


  it('should create a searchbar component', () => {
    let fixture = TestBed.createComponent(SearchbarComponent);
    let searchbar = fixture.debugElement.componentInstance;
    expect(searchbar)
  })
})