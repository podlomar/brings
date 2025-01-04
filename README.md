# brings

A declarative type-safe HTTP fetching library

## Installation

```bash
npm install brings
```

## Usage

Basic GET request looks like this:

```typescript
import brings from 'brings';

const data = await brings('https://jsonplaceholder.typicode.com/posts/1').trigger();
```

As you did not specify any response parsing, the `data` will be of type `Blob`. You can specify the response parsing by using the `parse` method:

```typescript
import brings from 'brings';
import { json } from 'brings/parsers';

const data = await brings('https://jsonplaceholder.typicode.com/posts/1')
  .parse(json())
  .trigger();
```

Now the `data` will be of type `unknown` as the `json` parser does not know the shape of the data. You can specify the type of the data by using the generic type parameter:

```typescript
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

const data = await brings('https://jsonplaceholder.typicode.com/posts/1')
  .parse(json<Post>())
  .trigger();
```

Now the `data` will be of type `Post`.

You can also specify standard request options like headers, method and body:

```typescript
const data = await brings('https://jsonplaceholder.typicode.com/posts/1')
  .method('GET')
  .header('Content-Type', 'application/json')
  .parse(json<Post>())
  .trigger();
```
