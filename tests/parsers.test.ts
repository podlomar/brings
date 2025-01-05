import nock from 'nock';
import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import brings from '../dist/index.js';
import { json, blob, text, arrayBuffer, formData } from '../dist/parser.js';

const URL = 'http://brings.test';

interface Payload {
  content: string;
}

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
    nock(URL).get('/').reply(200, { content: 'payload' });
    const data = await brings(URL)
      .parse(json())
      .trigger();
    expect(data).to.deep.equal({ content: 'payload' });
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

  it('should fetch json and map', async () => {
    nock(URL).get('/').reply(200, { content: 'payload' });
    const data = await brings(URL)
      .parse(
        json<Payload>().map((data) => data.content)
      )
      .trigger();
    expect(data).to.equal('payload');
  });
});
