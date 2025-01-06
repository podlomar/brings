import nock from 'nock';
import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import brings, { Caught } from '../dist/index.js';
import { json, blob, text, arrayBuffer, formData } from '../dist/parser.js';

const URL = 'http://brings.test';

interface Payload {
  content: string;
}

describe('Results', () => {
  it('should fetch implicit blob', async () => {
    nock(URL).get('/').reply(200, 'payload');
    const result = await brings(URL).bring();
    
    expect(result.status).to.equal('ok');
    if (result.status === 'ok') {
      expect(result.data).to.be.an.instanceof(Blob);
    }
  });

  it('should fetch blob', async () => {
    nock(URL).get('/').reply(200, 'payload');
    const result = await brings(URL)
      .parse(blob())
      .catchHttp((): Caught<'error'> => ({ error: 'error' }))
      .bring();
    expect(result.status).to.equal('ok');
    if (result.status === 'ok') {
      expect(result.data).to.be.an.instanceof(Blob);
    }
  });
});
