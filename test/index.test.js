import nock from 'nock';
import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import { brings } from '../dist/index.js';

const URL = 'http://bringy.test';

describe('bringy', () => {
  before(() => {
    nock(URL)
      .get('/')
      .reply(200, { payload: 'payload' });
  });

  it('should fetch json', async () => {
    const data = await brings(URL).trigger();
    expect(data).to.deep.equal({ payload: 'payload' });
  });
});
