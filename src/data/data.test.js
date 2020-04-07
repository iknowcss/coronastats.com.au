import path from 'path';
import { fetchData } from './data';

describe('data', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('parses the data into a usable format', async () => {
    fetch.mockResponse((req) => {
      return Promise.resolve(JSON.stringify(require(path.join('../../static', req.url))));
    });

    const data = await fetchData();
    expect(data[0]).toEqual(expect.objectContaining({
      stateCode: 'ALL',
      stateName: 'All',
    }));
    expect(data[0].dataset[0]).toEqual({
      x: new Date('2020-03-05T09:00:00.000+11:00'),
      y: 52,
    });
  });
});
