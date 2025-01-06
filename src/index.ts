import { RequestBody } from "./body.js";
import { HttpError } from "./errors.js";
import { ResponseParser, blob } from "./parser.js";
import { BringsResult } from "./result.js";

interface FetchParams {
  readonly url: URL;
  readonly method: string;
  readonly headers: Record<string, string>;
  readonly body: RequestBody | null;
}

interface Triggable<TData, TError> {
  trigger(): Promise<TData | TError>;
  bring(): Promise<BringsResult<TData, TError>>;
}

export type Caught<TError> = {
  error: TError;
} | 'unknown';

type CatchHttpFn<TError> = (error: HttpError) => Caught<TError>;

export class BringsConfig<TData, TError> {
  private fetchParams: FetchParams;
  private responseParser: ResponseParser<TData>;
  private catchHttpFn: CatchHttpFn<TError>;

  private constructor(
    fetchParams: FetchParams,
    responseParser: ResponseParser<TData>,
    catchHttpFn: CatchHttpFn<TError>,
  ) {
    this.fetchParams = fetchParams;
    this.responseParser = responseParser;
    this.catchHttpFn = catchHttpFn;
  }

  public static create(): BringsConfig<Blob, never> {
    return new BringsConfig(
      {
        url: new URL('http://localhost'),
        method: 'GET',
        headers: {},
        body: null,
      },
      blob(),
      () => 'unknown',
    );
  }

  public url(url: string): BringsConfig<TData, TError> {
    return new BringsConfig(
      { ...this.fetchParams, url: new URL(url) },
      this.responseParser,
      this.catchHttpFn,
    );
  }

  public method(method: string): BringsConfig<TData, TError> {
    return new BringsConfig(
      { ...this.fetchParams, method },
      this.responseParser,
      this.catchHttpFn,
    );
  }

  public body(body: RequestBody): BringsConfig<TData, TError> {
    return new BringsConfig(
      { ...this.fetchParams, body },
      this.responseParser,
      this.catchHttpFn,
    );
  }

  public header(name: string, value: string): BringsConfig<TData, TError> {
    return new BringsConfig(
      {
        ...this.fetchParams,
        headers: { ...this.fetchParams.headers, [name]: value },
      },
      this.responseParser,
      this.catchHttpFn,
    );
  }

  public param(name: string, value: string): BringsConfig<TData, TError> {
    const newUrl = new URL(this.fetchParams.url.toString());
    newUrl.searchParams.append(name, value);
    return new BringsConfig(
      { ...this.fetchParams, url: newUrl },
      this.responseParser,
      this.catchHttpFn,
    );
  }

  public parse<TNextData>(
    responseParser: ResponseParser<TNextData>
  ): BringsConfig<TNextData, TError> {
    return new BringsConfig(
      this.fetchParams,
      responseParser,
      this.catchHttpFn,
    );
  }

  public catchHttp<TNextError>(
    catchHttpFn: CatchHttpFn<TNextError>
  ): BringsConfig<TData, TNextError> {
    return new BringsConfig(this.fetchParams, this.responseParser, catchHttpFn);
  }

  public getFetchParams(): FetchParams {
    return this.fetchParams;
  }

  public getResponseParser(): ResponseParser<TData> {
    return this.responseParser;
  }

  public getCatchHttpFn(): CatchHttpFn<TError> | undefined {
    return this.catchHttpFn;
  }
}

export const triggerFetch = async <TData, TError>(
  config: BringsConfig<TData, TError>
): Promise<BringsResult<TData, TError>> => {
  const { url, method, headers, body } = config.getFetchParams();
  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...headers,
        'Content-Type': body?.contentType ?? '',
      },
      body: body?.init ?? null,
    });
    
    if (!response.ok) {
      const catchHttpFn = config.getCatchHttpFn();
      const error = new HttpError(response);
      if (catchHttpFn === undefined) {
        throw error;
      }

      const caught = catchHttpFn(error);
      if (caught === 'unknown') {
        throw error;
      }
      
      return {
        status: 'error',
        error: caught.error,
      }
    }

    const responseParser = config.getResponseParser();
    const data = await responseParser.parse(response);
    return { status: 'ok', data };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw error;
  }
}

export class Brings<TData, TError> implements Triggable<TData, TError> {
  private readonly config: BringsConfig<TData, TError>;

  public constructor(config: BringsConfig<TData, TError>) {
    this.config = config;
  }

  public async trigger(): Promise<TData | TError> {
    const result = await triggerFetch(this.config);
    return result.status === 'ok' ? result.data : result.error;
  }

  public async bring(): Promise<BringsResult<TData, TError>> {
    return triggerFetch(this.config);
  }
}

export class RequestBuilder<TData, TError> implements Triggable<TData, TError> {
  private config: BringsConfig<TData, TError>;

  private constructor(config: BringsConfig<TData, TError>) {
    this.config = config;
  }

  public static create(url: string): RequestBuilder<Blob, never> {
    return new RequestBuilder(BringsConfig.create().url(url));
  }

  public method(method: string): RequestBuilder<TData, TError> {
    return new RequestBuilder(this.config.method(method));
  }

  public body(requestBody: RequestBody): RequestBuilder<TData, TError> {
    return new RequestBuilder(this.config.body(requestBody));
  }

  public header(name: string, value: string): RequestBuilder<TData, TError> {
    return new RequestBuilder(this.config.header(name, value));
  }

  public param(name: string, value: string): RequestBuilder<TData, TError> {
    return new RequestBuilder(this.config.param(name, value));
  }

  public parse<TNextData>(
    responseParser: ResponseParser<TNextData>
  ): ResponseBuilder<TNextData, TError> {
    return new ResponseBuilder(this.config.parse(responseParser));
  }

  public async trigger(): Promise<TData | TError> {
    const result = await triggerFetch(this.config);
    return result.status === 'ok' ? result.data : result.error;
  }

  public async bring(): Promise<BringsResult<TData, TError>> {
    return triggerFetch(this.config);
  }
}

export class ResponseBuilder<TData, TError> implements Triggable<TData, TError> {
  private config: BringsConfig<TData, TError>;

  public constructor(config: BringsConfig<TData, TError>) {
    this.config = config;
  }

  public catchHttp<TNextError>(
    catchHttpFn: CatchHttpFn<TNextError>
  ): ResponseBuilder<TData, TNextError> {
    return new ResponseBuilder(this.config.catchHttp(catchHttpFn));
  }

  public async trigger(): Promise<TData | TError> {
    const result = await triggerFetch(this.config);
    return result.status === 'ok' ? result.data : result.error;
  }

  public async bring(): Promise<BringsResult<TData, TError>> {
    return triggerFetch(this.config);
  }
}

interface BringsFactory {
  (url: string): RequestBuilder<Blob, never>;
  (config: BringsConfig<Blob, never>): Brings<Blob, never>;
}

const brings = ((
  urlOrConfig: string | BringsConfig<Blob, never>
): RequestBuilder<Blob, never> | Brings<Blob, never> => {
  if (typeof urlOrConfig === 'string') {
    return RequestBuilder.create(urlOrConfig);
  }

  return new Brings<Blob, never>(urlOrConfig);
}) as BringsFactory;

export default brings;