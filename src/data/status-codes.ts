export interface StatusCode {
  code: number;
  name: string;
  summary: string;
  detail: string;
  category: 'informational' | 'success' | 'redirect' | 'client error' | 'server error';
}

export const statusCodes: StatusCode[] = [
  { code: 100, name: 'Continue', summary: 'The client should continue with the request.', detail: 'Sent to tell the client that the rest of the request will follow. Almost never seen in practice.', category: 'informational' },
  { code: 101, name: 'Switching Protocols', summary: 'The server agrees to change protocol.', detail: 'Used when a client asks to upgrade a connection, most often from HTTP to a WebSocket.', category: 'informational' },
  { code: 103, name: 'Early Hints', summary: 'Preliminary response sent before the final one.', detail: 'Lets the client start preloading resources while the server is still working on the response.', category: 'informational' },

  { code: 200, name: 'OK', summary: 'The request succeeded.', detail: 'The generic success response. The body contains whatever the endpoint decided to return.', category: 'success' },
  { code: 201, name: 'Created', summary: 'A new resource was created.', detail: 'The Location header should point at the new resource, and a representation of it is usually in the body.', category: 'success' },
  { code: 202, name: 'Accepted', summary: 'The request was accepted for processing.', detail: 'The work has not happened yet. Common for asynchronous jobs where a status URL is returned instead of the result.', category: 'success' },
  { code: 204, name: 'No Content', summary: 'The request succeeded with no body.', detail: 'Used for deletes and updates. A 204 response must not include a body.', category: 'success' },
  { code: 206, name: 'Partial Content', summary: 'Only part of the resource was returned.', detail: 'The response to a range request, used for resumable downloads and media seeking.', category: 'success' },

  { code: 301, name: 'Moved Permanently', summary: 'The resource has a new permanent URL.', detail: 'Search engines and clients cache this redirect, so use it only when the move is permanent.', category: 'redirect' },
  { code: 302, name: 'Found', summary: 'The resource is temporarily elsewhere.', detail: 'Historically a temporary redirect. Some clients still convert it to a GET even when the original was a POST.', category: 'redirect' },
  { code: 303, name: 'See Other', summary: 'The result is at a different URL.', detail: 'The right code after a successful POST, so that a refresh does not repost the form.', category: 'redirect' },
  { code: 304, name: 'Not Modified', summary: 'The cached copy is still valid.', detail: 'The response to a conditional request with a matching ETag or Last-Modified. No body is sent.', category: 'redirect' },
  { code: 307, name: 'Temporary Redirect', summary: 'Repeat the request at another URL.', detail: 'Preserves the method and the body, unlike 302, which is why it is the safer temporary redirect.', category: 'redirect' },
  { code: 308, name: 'Permanent Redirect', summary: 'Repeat the request at another URL, permanently.', detail: 'The permanent counterpart to 307, with the same method preservation.', category: 'redirect' },

  { code: 400, name: 'Bad Request', summary: 'The request could not be parsed.', detail: 'The generic client error. Use it when the request is malformed, and a more specific code when it parsed but failed validation.', category: 'client error' },
  { code: 401, name: 'Unauthorized', summary: 'Authentication is required or has failed.', detail: 'The name is misleading: it means unauthenticated. A WWW-Authenticate header is required by the specification.', category: 'client error' },
  { code: 403, name: 'Forbidden', summary: 'The server refuses to fulfil the request.', detail: 'The client is authenticated but not allowed to do this. The server will not say why, on purpose.', category: 'client error' },
  { code: 404, name: 'Not Found', summary: 'No resource matches the path.', detail: 'Also the right answer when you are deliberately hiding the existence of a resource from an unauthorised caller.', category: 'client error' },
  { code: 405, name: 'Method Not Allowed', summary: 'The method is not supported for this resource.', detail: 'The Allow header lists the methods that are supported.', category: 'client error' },
  { code: 409, name: 'Conflict', summary: 'The request conflicts with the current state.', detail: 'The right code for an optimistic concurrency failure, or for creating something that already exists.', category: 'client error' },
  { code: 410, name: 'Gone', summary: 'The resource existed and is deliberately gone.', detail: 'Clients and search engines are expected to drop it. Use 404 when you are not certain it will never come back.', category: 'client error' },
  { code: 412, name: 'Precondition Failed', summary: 'A conditional header did not match.', detail: 'Returned when an If-Match or If-Unmodified-Since check fails, which is how optimistic locking is usually implemented.', category: 'client error' },
  { code: 413, name: 'Content Too Large', summary: 'The request body is too large.', detail: 'The server refuses the payload. Cloud providers usually pair this with a specific limit and a link to the documentation.', category: 'client error' },
  { code: 415, name: 'Unsupported Media Type', summary: 'The content type is not accepted.', detail: 'The server does not support the format the client sent, for example sending XML to a JSON-only endpoint.', category: 'client error' },
  { code: 422, name: 'Unprocessable Content', summary: 'The body parsed but failed validation.', detail: 'The precise counterpart to 400: the request was well-formed and the content was wrong. Document which you use.', category: 'client error' },
  { code: 429, name: 'Too Many Requests', summary: 'The rate limit was exceeded.', detail: 'Always send a Retry-After header so a well-behaved client knows when to come back.', category: 'client error' },

  { code: 500, name: 'Internal Server Error', summary: 'Something failed on the server.', detail: 'The generic server error. It should never leak a stack trace to the client.', category: 'server error' },
  { code: 501, name: 'Not Implemented', summary: 'The server does not support the method.', detail: 'The functionality is not available at all, which is different from 405 where it exists but not for this resource.', category: 'server error' },
  { code: 502, name: 'Bad Gateway', summary: 'An upstream server returned an invalid response.', detail: 'Usually a reverse proxy talking to a service that is down or returning garbage.', category: 'server error' },
  { code: 503, name: 'Service Unavailable', summary: 'The server cannot handle the request right now.', detail: 'A temporary overload or a maintenance window. A Retry-After header is common here too.', category: 'server error' },
  { code: 504, name: 'Gateway Timeout', summary: 'An upstream server did not respond in time.', detail: 'The proxy gave up waiting. It usually points at a slow dependency rather than at the proxy itself.', category: 'server error' },
];

export const statusCategories = [
  'informational',
  'success',
  'redirect',
  'client error',
  'server error',
] as const;
