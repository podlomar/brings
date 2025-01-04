export class ResponseError extends Error {
  public readonly response: Response;

  public constructor(response: Response, message?: string) {
    super(message);
    this.response = response;
  }
}


export class HttpError extends ResponseError {
  public constructor(response: Response) {
    super(response, `HTTP error ${response.status} ${response.statusText}`);
  }
}

export class ParseError extends ResponseError {
  public constructor(response: Response, message?: string) {
    super(response, message);
  }
}
