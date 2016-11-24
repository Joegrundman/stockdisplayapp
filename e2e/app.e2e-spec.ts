import { StockdisplayappPage } from './app.po';

describe('stockdisplayapp App', function() {
  let page: StockdisplayappPage;

  beforeEach(() => {
    page = new StockdisplayappPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
