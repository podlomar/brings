import { RequestBody } from "./body.js";
import { HttpError } from "./errors.js";
import { ResponseParser, blob } from "./response-parser.js";

interface FetchParams {
  readonly url: URL;
  readonly method: string;
  readonly headers: Record<string, string>;
  readonly body: RequestBody | null;
}

interface Triggable<TData> {
  trigger(): Promise<TData>;
}

export class BringsConfig<TData> {
  private fetchParams: FetchParams;
  private responseParser: ResponseParser<TData>;

  private constructor(fetchParams: FetchParams, responseParser: ResponseParser<TData>) {
    this.fetchParams = fetchParams;
    this.responseParser = responseParser;
  }

  public static create(): BringsConfig<Blob> {
    return new BringsConfig(
      {
        url: new URL('http://localhost'),
        method: 'GET',
        headers: {},
        body: null,
      },
      blob(),
    );
  }

  public url(url: string): BringsConfig<TData> {
    return new BringsConfig(
      { ...this.fetchParams, url: new URL(url) }, this.responseParser,
    );
  }

  public method(method: string): BringsConfig<TData> {
    return new BringsConfig(
      { ...this.fetchParams, method }, this.responseParser,
    );
  }

  public body(body: RequestBody): BringsConfig<TData> {
    return new BringsConfig(
      { ...this.fetchParams, body }, this.responseParser,
    );
  }

  public header(name: string, value: string): BringsConfig<TData> {
    return new BringsConfig(
      {
        ...this.fetchParams,
        headers: { ...this.fetchParams.headers, [name]: value },
      },
      this.responseParser,
    );
  }

  public param(name: string, value: string): BringsConfig<TData> {
    const newUrl = new URL(this.fetchParams.url.toString());
    newUrl.searchParams.append(name, value);
    return new BringsConfig(
      { ...this.fetchParams, url: newUrl }, this.responseParser,
    );
  }

  public parse<TNextData>(responseParser: ResponseParser<TNextData>): BringsConfig<TNextData> {
    return new BringsConfig(this.fetchParams, responseParser);
  }

  public getFetchParams(): FetchParams {
    return this.fetchParams;
  }

  public getResponseParser(): ResponseParser<TData> {
    return this.responseParser;
  }
}

export const triggerFetch = async <TData>(config: BringsConfig<TData>): Promise<TData> => {
  const { url, method, headers, body } = config.getFetchParams();
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body?.init ?? null,
    });
    const responseParser = config.getResponseParser();
    return responseParser.parse(response);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw error;
  }
}

export class Brings<TData> implements Triggable<TData> {
  private readonly config: BringsConfig<TData>;

  public constructor(config: BringsConfig<TData>) {
    this.config = config;
  }

  public async trigger(): Promise<TData> {
    return triggerFetch(this.config);
  }
}

export class RequestBuilder<TData> implements Triggable<TData> {
  private config: BringsConfig<TData>;

  private constructor(config: BringsConfig<TData>) {
    this.config = config;
  }

  public static create(url: string): RequestBuilder<Blob> {
    return new RequestBuilder(BringsConfig.create().url(url));
  }

  public method(method: string): RequestBuilder<TData> {
    return new RequestBuilder(this.config.method(method));
  }

  public body(requestBody: RequestBody): RequestBuilder<TData> {
    return new RequestBuilder(this.config.body(requestBody));
  }

  public header(name: string, value: string): RequestBuilder<TData> {
    return new RequestBuilder(this.config.header(name, value));
  }

  public param(name: string, value: string): RequestBuilder<TData> {
    return new RequestBuilder(this.config.param(name, value));
  }

  public parse<TNextData>(
    responseParser: ResponseParser<TNextData>
  ): ResponseBuilder<TNextData> {
    return new ResponseBuilder(this.config.parse(responseParser));
  }

  public async trigger(): Promise<TData> {
    return triggerFetch(this.config);
  }
}

export class ResponseBuilder<TData> implements Triggable<TData> {
  private config: BringsConfig<TData>;

  public constructor(config: BringsConfig<TData>) {
    this.config = config;
  }

  public trigger(): Promise<TData> {
    return triggerFetch(this.config);
  }
}

interface BringsFactory {
  (url: string): RequestBuilder<Blob>;
  (config: BringsConfig<Blob>): Brings<Blob>;
}

export const brings = ((
  urlOrConfig: string | BringsConfig<Blob>
): RequestBuilder<Blob> | Brings<Blob> => {
  if (typeof urlOrConfig === 'string') {
    return RequestBuilder.create(urlOrConfig);
  }

  return new Brings<Blob>(urlOrConfig);
}) as BringsFactory;
