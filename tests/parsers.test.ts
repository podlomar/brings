import nock from 'nock';
import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import brings from '../dist/index.js';
import { json, blob, text, arrayBuffer, formData } from '../dist/parser.js';

const URL = 'http://brings.test';

describe('Response parsers', () => {
  it('should fetch implicit blob', async () => {
    nock(URL).get('/').reply(200, 'payload');
    const blob = await brings(URL).trigger();
    expect(blob).to.be.an.instanceof(Blob);
  });

  it('should fetch blob', async () => {
    nock(URL).get('/').reply(200, 'payload');
    const data = await brings(URL)
      .parse(blob())
      .trigger();
    expect(data).to.be.an.instanceof(Blob);
  });

  it('should fetch json', async () => {
    nock(URL).get('/').reply(200, { payload: 'payload' });
    const data = await brings(URL)
      .parse(json())
      .trigger();
    expect(data).to.deep.equal({ payload: 'payload' });
  });

  it('should fetch text', async () => {
    nock(URL).get('/').reply(200, 'payload');
    const data = await brings(URL)
      .parse(text())
      .trigger();
    expect(data).to.equal('payload');
  });

  it('should fetch arrayBuffer', async () => {
    nock(URL).get('/').reply(200, 'payload');
    const data = await brings(URL)
      .parse(arrayBuffer())
      .trigger();
    expect(data).to.be.an.instanceof(ArrayBuffer);
  });
  
  // it('should fetch formData', async () => {
  //   nock(URL).get('/').reply(200, 'payload');
  //   const data = await brings(URL)
  //     .parse(formData())
  //     .trigger();
  //   expect(data).to.be.an.instanceof(FormData);
  // });
});
