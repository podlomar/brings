import nock from 'nock';
import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import { brings, Caught } from '../dist/index.js';
import { json } from '../dist/response-parser.js';

const URL = 'http://brings.test';

describe('brings', () => {
  beforeEach(() => {
    nock(URL)
      .get('/')
      .reply(200, { payload: 'payload' });
    nock(URL)
      .get('/error')
      .reply(500, { error: 'error' });
  });

  it('should fetch blob', async () => {
    const blob = await brings(URL).trigger();
    expect(blob).to.be.an.instanceof(Blob);
  });

  it('should fetch json', async () => {
    const data = await brings(URL)
      .parse(json())
      .trigger();
    expect(data).to.deep.equal({ payload: 'payload' });
  });

  it('should fetch json with HTTP error', async () => {
    const data = await brings(`${URL}/error`)
      .parse(json())
      .catchHttp((): Caught<'error'> => ({ error: 'error' }))
      .trigger();
    expect(data).to.equal('error');
  });
});
