import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { createSleeperApi } from './sleeper-api';
import transactionsFixture from './__fixtures__/transactions-response.json';

const server = setupServer(
  http.get('https://api.sleeper.app/v1/league/league123/transactions/1', () => {
    return HttpResponse.json(transactionsFixture);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Sleeper API Contract', () => {
  it('fetches transactions with expected structure', async () => {
    const sleeperApi = createSleeperApi();
    const transactions = await sleeperApi.getTransactions('league123', 1);

    expect(transactions).toEqual([
      {
        type: 'free_agent',
        drops: { '1': '2124' },
        creator: 'user123',
        created: 1693843200000
      },
      {
        type: 'trade',
        creator: 'user456',
        created: 1693929600000
      }
    ]);
  });
});
